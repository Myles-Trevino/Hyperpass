/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import type {Tabs} from 'webextension-polyfill-ts';
import {browser} from 'webextension-polyfill-ts';

import type {Types} from 'hyperpass-core';
import {UtilityService, AccountService} from 'hyperpass-core';


@Injectable({providedIn: 'root'})

export class BackgroundService
{
	private website = '';
	private accounts: Record<string, Types.Account> = {};
	private account?: Types.Account;
	private logInPromise?: Promise<void>;


	// Constructor.
	public constructor(private readonly utilityService: UtilityService,
		private readonly accountService: AccountService){}


	// Initializer.
	public initialize(): void
	{
		// Disable navigation.
		this.accountService.navigate = false;

		// Handle update messages from the popup.
		browser.runtime.onMessage.addListener(async (message: Types.Message) =>
		{
			// Login and logout.
			if(message.type === 'loginUpdate')
			{
				if(message.data as boolean)
				{
					this.logInPromise = this.accountService.automaticLogIn();
					await this.logInPromise;
				}
				else await this.accountService.logOut();
				this.update();
			}

			// Vault updates.
			if(message.type === 'vaultUpdate')
			{
				await this.logInPromise; // Ensure the login has completed first.
				await this.accountService.pullVault();
				this.update();
			}

			// Login timeout resets.
			if(message.type === 'loginTimeoutReset')
			{
				this.accountService.loginTimeoutDuration = message.data as number;
				this.accountService.resetLoginTimeout();
			}
		});

		// Handle login timeouts.
		this.accountService.loginTimeoutSubject.subscribe(() => { this.update(); });

		// URL change callback.
		browser.tabs.onActivated.addListener(
			(activeInfo) => { this.tabActivatedCallback(activeInfo); });

		browser.tabs.onUpdated.addListener((tabId, changeInfo) =>
		{ if(changeInfo.url) this.urlChangeCallback(changeInfo.url); });

		// Context menu click callback.
		browser.contextMenus.onClicked.addListener((info) =>
		{
			const menuItemId = info.menuItemId.toString();
			this.handleAutofill(menuItemId);

			const dashIndex = menuItemId.indexOf('-');
			if(dashIndex !== -1) this.setDefaultAccount(menuItemId.substring(dashIndex+1));
		});

		// Command callback.
		browser.commands.onCommand.addListener(
			(command) => { this.handleAutofill(command); });

		// Create the context menus.
		this.createContextMenus();
	}


	// Tab activation callback.
	private async tabActivatedCallback(
		activeInfo: Tabs.OnActivatedActiveInfoType): Promise<void>
	{
		const tab = await browser.tabs.get(activeInfo.tabId);
		this.urlChangeCallback(tab.url);
	}


	// URL change callback.
	private urlChangeCallback(url: string | undefined): void
	{
		if(!url) return;

		// Extract the domain from the URL.
		this.website = this.utilityService.extractDomain(url);

		// Update.
		if(this.accountService.loggedIn) this.update();
	}


	// Updates the available accounts and the context menu.
	private update(): void
	{
		try
		{
			// Update the available accounts.
			this.accounts = {};
			this.account = undefined;

			if(this.accountService.loggedIn && this.website)
			{
				// Add accounts that match the current
				// website to the available accounts array.
				const vault = this.accountService.getVault();
				for(const [key, value] of Object.entries(vault.accounts))
				{
					if(!this.accountMatchesWebsite(value)) continue;
					this.accounts[key] = value;
					if(value.default) this.account = value;
				}
			}

			// Update the context menu.
			this.createContextMenus();
		}

		// Catch errors.
		catch(error: unknown){}
	}


	// Checks if the given account matches the current website.
	private accountMatchesWebsite(account: Types.Account): boolean
	{
		const urls = account.url.split(',');

		for(let url of urls)
		{
			url = url.trim();
			if(url && this.website.includes(url)) return true;
		}

		return false;
	}


	// Creates the context menus.
	private createContextMenus(): void
	{
		browser.contextMenus.removeAll();

		// Root.
		if(this.accountService.loggedIn) browser.contextMenus.create(
			{id: 'Hyperpass', title: 'Hyperpass', contexts: ['all']});

		else
		{
			browser.contextMenus.create({id: 'Hyperpass (Locked)',
				title: 'Hyperpass (Locked)', contexts: ['all']});

			return;
		}

		// Options.
		if(this.account)
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
		if(Object.keys(this.accounts).length < 2) return;

		browser.contextMenus.create({parentId: 'Hyperpass',
			type: 'separator', contexts: ['all']});

		browser.contextMenus.create({parentId: 'Hyperpass',
			id: 'Account', title: 'Account', contexts: ['all']});

		for(const [key, account] of Object.entries(this.accounts))
			browser.contextMenus.create
			({
				parentId: 'Account',
				id: `Account-${key}`,
				title: account.username,
				type: 'radio',
				checked: account.default,
				contexts: ['all']
			});
	}


	// Sends the content script a message to perform autofilling.
	private handleAutofill(action: string): void
	{
		if(action === 'Autofill Username')
			this.sendMessage({type: 'Autofill', data: this.account?.username});

		else if(action === 'Autofill Password')
			this.sendMessage({type: 'Autofill', data: this.account?.password});
	}


	// Sends a message to the active tab.
	private async sendMessage(message: Types.Message): Promise<void>
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


	// Sets the account with the given key as the default for its URL.
	private setDefaultAccount(key: string): void
	{
		const accounts = this.accountService.getVault().accounts;
		const account = accounts[key];

		for(const value of Object.values(accounts))
			if(account.url === value.url) value.default = false;

		account.default = true;
		this.account = account;
		this.accountService.pushVault();
	}
}
