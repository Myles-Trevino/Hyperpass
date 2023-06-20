/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import browser from 'webextension-polyfill';

import {Types, Utilities} from 'builds/hyperpass-common';


/*
let website = '';
let loggedIn = false;
let accounts: Record<string, Types.Account> = {};
let matchingAccounts: Record<string, Types.Account> = {};
let selectedAccount: Types.AccountEntry | undefined = undefined;
let manuallySelected = false;
*/

type State = {
	website: string;
	loggedIn: boolean;
	accounts: Record<string, Types.Account>;
	matchingAccounts: Record<string, Types.Account>;
	selectedAccount: Types.AccountEntry | undefined;
	manuallySelected: false;
};

const defaultState: State = {
	website: '',
	loggedIn: false,
	accounts: {},
	matchingAccounts: {},
	selectedAccount: undefined,
	manuallySelected: false
};


// Set default state.
await resetState();


// Handle update messages.
browser.runtime.onMessage.addListener(async (message: Types.Message) =>
{
	// Debug.
	// console.log('Received message', message);

	// Handle login and logout messages.
	if(message.type === 'loginUpdate')
	{
		const loggedIn = message.data as boolean;
		await save({loggedIn});
		if(!loggedIn) logOut();
	}

	// Handle vault update messages.
	else if(message.type === 'vaultUpdate')
	{
		await save({accounts: message.data as Record<string, Types.Account>});
		await update();
	}

	// Handle login timeout reset messages.
	// (References account.service.ts startLoginTimeout())
	else if(message.type === 'loginTimeoutReset')
	{
		const loginTimeoutDuration = (message.data as number);

		// Stop the timeout if it has been started.
		await stopLoginTimeout();

		// Start the timeout.
		browser.alarms.create('loginTimeout', {delayInMinutes: loginTimeoutDuration});
		browser.alarms.onAlarm.addListener(() => { logOut(); });
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


// Tab activation callback.
async function tabActivatedCallback(
	activeInfo: browser.Tabs.OnActivatedActiveInfoType): Promise<void>
{
	const tab = await browser.tabs.get(activeInfo.tabId);
	urlChangeCallback(tab.url);
}


// URL change callback.
async function urlChangeCallback(url: string | undefined): Promise<void>
{
	if(url === undefined) return;
	if(Utilities.isInternalUrl(url)) url = '';
	url = Utilities.trimUrl(url);

	await save({website: url});
	await update();
}


// Context menu callback.
async function contextMenuCallback(info: browser.Menus.OnClickData): Promise<void>
{
	// Apply the manual selection.
	const menuItemId = info.menuItemId.toString();
	handleAutofill(menuItemId);

	const dashIndex = menuItemId.indexOf('-');
	if(dashIndex !== -1)
	{
		const key = menuItemId.substring(dashIndex+1);

		const matchingAccounts =
			await load<Record<string, Types.Account>>('matchingAccounts');

		const selectedAccount = {...matchingAccounts[key], key};
		const manuallySelected = true;

		await save({selectedAccount, manuallySelected});
	}
}


// Updates the available accounts and the context menu.
async function update(): Promise<void>
{
	// Update the available accounts.
	const matchingAccounts: Record<string, Types.Account> = {};

	let newSelectedAccount: Types.AccountEntry | undefined = undefined;
	let currentSelectedAccountFound = false;

	const website = await load<string>('website');
	const selectedAccount = await load<Types.AccountEntry | undefined>('selectedAccount');
	const accounts = await load<Record<string, Types.Account>>('accounts');

	// If on a website...
	if(website)
	{
		// Add accounts that match the current website to the available accounts array.
		for(const [key, value] of Object.entries(accounts))
		{
			if(!Utilities.accountMatchesWebsite(value, website)) continue;
			matchingAccounts[key] = value;

			// Check if the currently selected account is still an option.
			if(selectedAccount?.key === key) currentSelectedAccountFound = true;

			// If this is the default, use it.
			if(!newSelectedAccount || value.default) newSelectedAccount = {...value, key};
		}

		// Update the selected account if appropriate.
		const manuallySelected = await load<boolean>('manuallySelected');

		if(!selectedAccount || !currentSelectedAccountFound || !manuallySelected)
			await save({selectedAccount: newSelectedAccount, manuallySelected: false});
	}

	await save({matchingAccounts});

	// Reset the selected account if appropriate.
	if(Object.keys(matchingAccounts).length < 1)
		browser.storage.local.remove('selectedAccount');

	// Update the context menu.
	await createContextMenus();
}


// Creates the context menus.
async function createContextMenus(): Promise<void>
{
	await browser.contextMenus.removeAll();

	// Root.
	const loggedIn = await load<boolean>('loggedIn');

	if(loggedIn) browser.contextMenus.create(
		{id: 'Hyperpass', title: 'Hyperpass', contexts: ['all']});

	else
	{
		browser.contextMenus.create({id: 'Hyperpass (Locked)',
			title: 'Hyperpass (Locked)', contexts: ['all']});

		return;
	}

	// Options.
	const selectedAccount = await load<Types.AccountEntry | undefined>('selectedAccount');

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
			id: 'No Accounts', title: 'No Accounts', contexts: ['all']});
		return;
	}

	// Accounts.
	const matchingAccounts = await load<Record<string, Types.Account>>('matchingAccounts');
	if(Object.keys(matchingAccounts).length < 2) return;

	browser.contextMenus.create({parentId: 'Hyperpass',
		id: 'Separator', type: 'separator', contexts: ['all']});

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
async function handleAutofill(action: string): Promise<void>
{
	const selectedAccount = await load<Types.AccountEntry | undefined>('selectedAccount');

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

		await browser.scripting.executeScript(
			{target: {tabId: tab.id}, files: ['runtime.js', 'content.js']});

		browser.tabs.sendMessage(tab.id, message);
	}
}


// Stops the login timeout.
async function stopLoginTimeout(): Promise<void>
{
	await browser.alarms.clear('loginTimeout');
}


// Logs out.
async function logOut(): Promise<void>
{
	await resetState();
	await stopLoginTimeout();
	update();
}

// State helpers.
async function resetState(): Promise<void>
{
	await browser.storage.local.clear();
	await save({...defaultState});
}

async function save(data: Object): Promise<void>
{
	await browser.storage.local.set(data);
}

async function load<T>(key: string): Promise<T>
{
	return (await browser.storage.local.get(key))[key] as T;
}
