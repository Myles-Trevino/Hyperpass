/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import browser from 'webextension-polyfill';

import type {Types} from 'hyperpass-core';


let website = '';
let loggedIn = false;
let loginTimeoutTimeout: NodeJS.Timeout | undefined = undefined;
let accounts: Record<string, Types.Account> = {};
let matchingAccounts: Record<string, Types.Account> = {};
let selectedAccount: Types.AccountEntry | undefined = undefined;
let manuallySelected = false;


// Initialize.
function initialize(): void
{
	// Handle update messages.
	browser.runtime.onMessage.addListener((message: Types.Message) =>
	{
		// Handle login and logout messages.
		if(message.type === 'loginUpdate')
		{
			loggedIn = message.data as boolean;
			if(!loggedIn) logOut();
		}

		// Handle vault update messages.
		else if(message.type === 'vaultUpdate')
		{
			accounts = message.data as Record<string, Types.Account>;
			update();
		}

		// Handle login timeout reset messages.
		// (partial duplicate code from account.service.ts startLoginTimeout()).
		else if(message.type === 'loginTimeoutReset')
		{
			const loginTimeoutDuration = (message.data as number);

			// Stop the timeout if it has been started.
			stopLoginTimeout();

			// Start the timeout.
			loginTimeoutTimeout = setTimeout(
				() => { logOut(); }, loginTimeoutDuration*60*1000);
		}
	});

	// URL change callback.
	browser.tabs.onActivated.addListener(
		(activeInfo) => { tabActivatedCallback(activeInfo); });

	browser.tabs.onUpdated.addListener(
		(tabId, changeInfo) => { urlChangeCallback(changeInfo.url); });

	// Context menu click callback.
	browser.contextMenus.onClicked.addListener(
		(info) => { contextMenuCallback(info); });

	// Command callback.
	browser.commands.onCommand.addListener(
		(command) => { handleAutofill(command); });

	// Create the context menus.
	createContextMenus();
}

initialize();


// Tab activation callback.
async function tabActivatedCallback(
	activeInfo: browser.Tabs.OnActivatedActiveInfoType): Promise<void>
{
	const tab = await browser.tabs.get(activeInfo.tabId);
	urlChangeCallback(tab.url);
}


// URL change callback.
function urlChangeCallback(url: string | undefined): void
{
	if(!url) return;

	// Trim the URL (duplicate code from utility.service.ts trimUrl()).
	url = url.toLowerCase();
	const start = url.indexOf('://');
	if(start !== -1) url = url.substring(start+3);
	const end = url.indexOf('/');
	if(end !== -1) url = url.substring(0, end);
	url = url.replace('www.', '');

	// Update the URL.
	if(!url) return;
	website = url;
	update();
}


// Context menu callback.
function contextMenuCallback(info: browser.Menus.OnClickData): void
{
	// Apply the manual selection.
	const menuItemId = info.menuItemId.toString();
	handleAutofill(menuItemId);

	const dashIndex = menuItemId.indexOf('-');
	if(dashIndex !== -1)
	{
		const key = menuItemId.substring(dashIndex+1);
		selectedAccount = {...matchingAccounts[key], key};
		manuallySelected = true;
	}
}


// Updates the available accounts and the context menu.
function update(): void
{
	// Update the available accounts.
	matchingAccounts = {};
	let newSelectedAccount: Types.AccountEntry | undefined = undefined;
	let currentSelectedAccountFound = false;

	if(website)
	{
		// Add accounts that match the current
		// website to the available accounts array.
		for(const [key, value] of Object.entries(accounts))
		{
			if(!accountMatchesWebsite(value)) continue;
			matchingAccounts[key] = value;

			// Check if the currently selected account is still an option.
			if(selectedAccount?.key === key) currentSelectedAccountFound = true;

			// If this is the default, use it.
			if(!newSelectedAccount || value.default) newSelectedAccount = {...value, key};
		}
	}

	// Update the selected account if appropriate.
	if(!selectedAccount || !currentSelectedAccountFound || !manuallySelected)
	{
		manuallySelected = false;
		selectedAccount = newSelectedAccount;
	}

	// Update the context menu.
	createContextMenus();
}


// Checks if the given account matches the current website.
// (duplicate code from utility.service.ts accountMatchesWebsite()).
function accountMatchesWebsite(account: Types.Account): boolean
{
	const urls = account.url.split(',');

	for(let url of urls)
	{
		url = url.trim();
		if(url && website.includes(url)) return true;
	}

	return false;
}


// Creates the context menus.
function createContextMenus(): void
{
	browser.contextMenus.removeAll();

	// Root.
	if(loggedIn) browser.contextMenus.create(
		{id: 'Hyperpass', title: 'Hyperpass', contexts: ['all']});

	else
	{
		browser.contextMenus.create({id: 'Hyperpass (Locked)',
			title: 'Hyperpass (Locked)', contexts: ['all']});

		return;
	}

	// Options.
	if(selectedAccount)
	{
		browser.contextMenus.create({parentId: 'Hyperpass', id: 'Autofill Username',
			title: 'Autofill Username', contexts: ['all']});

		browser.contextMenus.create({parentId: 'Hyperpass', id: 'Autofill Password',
			title: 'Autofill Password', contexts: ['all']});
	}

	else
	{
		browser.contextMenus.create({parentId: 'Hyperpass',
			title: 'No Accounts', contexts: ['all']});
		return;
	}

	// Accounts.
	if(Object.keys(matchingAccounts).length < 2) return;

	browser.contextMenus.create({parentId: 'Hyperpass',
		type: 'separator', contexts: ['all']});

	browser.contextMenus.create({parentId: 'Hyperpass',
		id: 'Account', title: 'Account', contexts: ['all']});

	for(const [key, account] of Object.entries(matchingAccounts))
		browser.contextMenus.create
		({
			parentId: 'Account',
			id: `Account-${key}`,
			title: account.username,
			type: 'radio',
			checked: (key === selectedAccount.key),
			contexts: ['all']
		});
}


// Sends the content script a message to perform autofilling.
function handleAutofill(action: string): void
{
	if(action === 'Autofill Username')
		sendMessage({type: 'Autofill', data: selectedAccount?.username});

	else if(action === 'Autofill Password')
		sendMessage({type: 'Autofill', data: selectedAccount?.password});
}


// Sends a message to the active tab.
async function sendMessage(message: Types.Message): Promise<void>
{
	const tabs = await browser.tabs.query({currentWindow: true, active: true});
	for(const tab of tabs)
	{
		if(tab.id === undefined) continue;
		await browser.tabs.executeScript(tab.id, {file: 'runtime.js'});
		await browser.tabs.executeScript(tab.id, {file: 'content.js'});
		browser.tabs.sendMessage(tab.id, message);
	}
}


// Stops the login timeout.
function stopLoginTimeout(): void
{
	if(loginTimeoutTimeout)
	{
		clearTimeout(loginTimeoutTimeout);
		loginTimeoutTimeout = undefined;
	}
}


// Logs out.
function logOut(): void
{
	website = '';
	loggedIn = false;
	stopLoginTimeout();
	accounts = {};
	matchingAccounts = {};
	selectedAccount = undefined;

	update();
}
