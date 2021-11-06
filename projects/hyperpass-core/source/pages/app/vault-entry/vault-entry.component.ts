/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import {Component, HostBinding, ViewChild} from '@angular/core';
import type {Subscription} from 'rxjs';
import {NgScrollbar} from 'ngx-scrollbar';
import * as Ionic from '@ionic/angular';
import * as _ from 'lodash';
import {parseDomain, ParseResultType} from 'parse-domain';

import {Types, Constants, Utilities} from 'builds/hyperpass-common';

import {UtilityService} from '../../../services/utility.service';
import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {GeneratorService} from '../../../services/generator.service';
import {StateService} from '../../../services/state.service';
import {PlatformService} from '../../../services/platform.service';


@Component
({
	selector: 'hyperpass-vault-entry',
	templateUrl: './vault-entry.component.html'
})

export class VaultEntryComponent implements OnInit, OnDestroy, AfterViewInit
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;


	public showUrlWarning = false;
	public state: Types.VaultEntryState = _.clone(Types.defaultVaultEntryState);

	private modalSubscription?: Subscription;
	private backButtonSubscription?: Subscription;
	private scrollbarSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		public readonly utilityService: UtilityService,
		public readonly stateService: StateService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly generatorService: GeneratorService,
		private readonly ionicPlatform: Ionic.Platform){}


	// Initializer.
	public ngOnInit(): void
	{
		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(100, () => { this.utilityService.close('vault'); });

		// If there is cached state, load it.
		if(this.stateService.vaultEntry) this.state = this.stateService.vaultEntry;

		// Otherwise...
		else
		{
			// If a key was given, load that entry's state.
			const key = this.utilityService.loadUrlParameter('key');

			if(key)
			{
				const account = this.getAccounts()[key];
				this.state = {..._.cloneDeep(account), key, title: key, scrollPosition: 0};
			}

			// Otherwise, autofill the appropriate fields.
			else this.autofill();

			this.stateService.vaultEntry = this.state;
		}

		// Update the URL warning.
		this.updateUrlWarning();
	}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.scrollbarSubscription = await this.stateService
			.initializeScrollbar(this.state, this.scrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.backButtonSubscription?.unsubscribe();
		this.modalSubscription?.unsubscribe();
		this.scrollbarSubscription?.unsubscribe();
	}


	// Saves the account, pushes the vault, and exits.
	public save(): void
	{
		try
		{
			// Validate.
			if(!this.state.title) throw new Error('Please enter a title.');

			if(this.state.note && this.state.note.length > 3000) throw new Error(
				'Notes are limited to 3000 characters. Please shorten your note.');

			const accounts = this.getAccounts();

			if(this.state.title !== this.state.key && _.has(accounts, this.state.title))
				throw new Error(`Another account already has this title.`);

			// Otherwise if there is another default for this URL and this account
			// has been manually set as the default, make this the only default.
			if(this.defaultExists(accounts) && this.state.default)
			{
				for(const value of Object.values(accounts))
					if(Utilities.accountMatchesWebsite(this.state, value.url))
						value.default = false;
			}

			// Update the history.
			this.state.usernameHistory = this.utilityService.addToVaultEntryHistory(
				this.state.usernameHistory, this.state.username);

			this.state.passwordHistory = this.utilityService.addToVaultEntryHistory(
				this.state.passwordHistory, this.state.password);

			this.state.noteHistory = this.utilityService.addToVaultEntryHistory(
				this.state.noteHistory, this.state.note);

			// If the entry exists, update it.
			if(this.state.key)
			{
				if(!_.has(accounts, this.state.key))
					throw new Error(`Failed to update the account.`);

				delete accounts[this.state.key];
				accounts[this.state.title] = _.cloneDeep(this.state);
			}

			// Otherwise, create a new entry.
			else
			{
				if(Object.keys(accounts).length > Constants.maximumVaultEntries)
					throw new Error('You have exceeded the maximum number of vault entries.'+
					'Please remove any unneeded entries and try again.');

				accounts[this.state.title] = _.cloneDeep(this.state);
			}

			// Update the vault.
			this.pushAndExit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Adds the entry to vault history, deletes it from the vault, and exits.
	public delete(): void
	{
		try
		{
			if(!this.state.key) return;
			const accounts = this.getAccounts();

			// If there is another account with this URL, make it the default.
			for(const [key, value] of Object.entries(accounts))
				if(value.url.includes(this.state.url)) accounts[key].default = true;

			// Add the entry to history.
			const vault = this.accountService.getVault();

			vault.history.unshift({key: this.state.key,
				value: _.cloneDeep(this.state), date: new Date()});

			vault.history = vault.history.slice(0, Constants.maximumHistoryEntries);

			// Delete.
			if(this.state.key) delete accounts[this.state.key];

			// Push the vault and exit.
			this.pushAndExit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Opens the username history modal.
	public viewUsernameHistory(): void
	{
		try
		{
			this.viewHistory(this.state.usernameHistory, (history) =>
			{
				this.state.usernameHistory = history;
				this.accountService.pushVault();
			});
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Generates a password.
	public generatePassword(): void
	{ this.state.password = this.generatorService.generate(); }


	// Opens the password history modal.
	public viewPasswordHistory(): void
	{
		try
		{
			this.viewHistory(this.state.passwordHistory, (history) =>
			{
				this.state.passwordHistory = history;
				this.accountService.pushVault();
			});
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// URL change callback.
	public urlChangeCallback(url: string): void
	{
		this.state.url = url;
		this.updateUrlWarning();
	}


	// Opens the note history modal.
	public viewNoteHistory(): void
	{
		try
		{
			this.viewHistory(this.state.noteHistory, (history) =>
			{
				this.state.noteHistory = history;
				this.accountService.pushVault();
			});
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Returns to the vault page.
	public exit(): void
	{
		this.stateService.vaultEntry = undefined;
		this.utilityService.close('vault');
	}


	// Checks whether a default already exists for this URL.
	private defaultExists(accounts: Record<string, Types.Account>): boolean
	{
		for(const [key, value] of Object.entries(accounts))
			if(Utilities.accountMatchesWebsite(value, this.state.url) &&
				key !== this.state.key) return true;

		return false;
	}


	// Autofills the appropriate fields.
	private autofill(): void
	{
		// Generate a password.
		this.generatePassword();

		// Autofill the title and URL.
		if(!this.platformService.isExtension) return;
		const rawUrl = Utilities.trimUrl(this.stateService.url);
		const result = parseDomain(rawUrl);

		let url = '';
		if(result.type === ParseResultType.Listed && result.domain)
			url = `${result.domain}.${result.topLevelDomains.join('.')}`;
		else url = rawUrl;

		this.state.title = url;
		this.state.url = url;
	}


	// Returns the vault's account entries.
	private getAccounts(): Record<string, Types.Account>
	{ return this.accountService.getVault().accounts; }


	// Opens the history modal for the given history entries.
	private viewHistory(history: Types.VaultEntryHistoryEntry[],
		updateCallback: (updatedHistory: Types.VaultEntryHistoryEntry[]) => void): void
	{
		// Open the history modal.
		this.stateService.vaultEntryHistoryModal.history = history;
		this.stateService.openModal('Vault Entry History');

		// Update the history if appropriate.
		this.modalSubscription?.unsubscribe();
		this.modalSubscription =
			this.stateService.vaultEntryHistoryModalSubject.subscribe(updateCallback);
	}


	// Sends the given message, pushes the vault, and exits.
	private pushAndExit(): void
	{
		try
		{
			this.accountService.pushVault();
			this.exit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Updates the URL warning.
	private updateUrlWarning(): void
	{
		const undesiredTokens = [':', '/', 'www.'];
		this.showUrlWarning = false;

		for(const token of undesiredTokens)
			if(this.state.url.includes(token)) this.showUrlWarning = true;
	}
}
