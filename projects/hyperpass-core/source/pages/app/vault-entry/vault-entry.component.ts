/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Settings from '../../../settings';
import {UtilityService} from '../../../services/utility.service';
import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {GeneratorService} from '../../../services/generator.service';
import {StateService} from '../../../services/state.service';


@Component
({
	selector: 'hyperpass-vault-entry',
	templateUrl: './vault-entry.component.html'
})

export class VaultEntryComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';


	public key?: string;
	public title = '';
	public state: Types.Account = Types.defaultAccount;
	public showUrlWarning = false;

	private modalSubscription?: Subscription;


	// Constructor.
	public constructor(private readonly accountService: AccountService,
		private readonly router: Router,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		private readonly stateService: StateService,
		private readonly generatorService: GeneratorService){}


	// Initializer.
	public ngOnInit(): void
	{
		// If a key was given, load that entry's state.
		this.key = this.utilityService.loadUrlParameter('key');

		if(this.key)
		{
			this.title = this.key;

			const account = this.getAccounts()[this.key];
			this.state = _.cloneDeep(account);
		}

		this.updateUrlWarning();
	}


	// Destructor.
	public ngOnDestroy(): void { this.modalSubscription?.unsubscribe(); }


	// Saves the account, pushes the vault, and exits.
	public save(): void
	{
		try
		{
			// Validate.
			if(!this.title) throw new Error('Please enter a title.');

			if(this.state.note && this.state.note.length > 3000) throw new Error(
				'Notes are limited to 3000 characters. Please shorten your note.');

			const accounts = this.getAccounts();

			if(this.title !== this.key && _.has(accounts, this.title))
				throw new Error(`Another account already has this title.`);

			// If the entry exists, update it.
			if(this.key)
			{
				if(!_.has(accounts, this.key))
					throw new Error(`Failed to update the account.`);

				delete accounts[this.key];
				accounts[this.title] = this.state;
			}

			// Otherwise, create a new entry.
			else
			{
				if(Object.keys(accounts).length > 10000) throw new Error('The number of '+
					'accounts is limited to 10,000. Please remove any unneeded accounts '+
					'and try again.');

				accounts[this.title] = this.state;
			}

			// If there is no default for this URL, make this account the default.
			let hasDefault = false;
			for(const value of Object.values(accounts))
				if(value.url.includes(this.state.url)){ hasDefault = true; break; }

			if(!hasDefault) this.state.default = true;

			// Update the history.
			this.addToHistory(this.state.username, this.state.usernameHistory);
			this.addToHistory(this.state.password, this.state.passwordHistory);
			this.addToHistory(this.state.note, this.state.noteHistory);

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
			if(!this.key) return;
			const accounts = this.getAccounts();

			// If there is another account with this URL, make it the default.
			for(const [key, value] of Object.entries(accounts))
				if(value.url.includes(this.state.url)) accounts[key].default = true;

			// Add the entry to history.
			const vault = this.accountService.getVault();
			vault.history.unshift({key: this.key, value: this.state, date: new Date()});
			if(vault.history.length > Settings.maximumHistoryEntries) vault.history.pop();

			// Delete.
			if(this.key) delete accounts[this.key];

			// Push the vault and exit.
			this.pushAndExit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Opens the username history modal.
	public viewUsernameHistory(): void
	{
		this.viewHistory(this.state.usernameHistory, (history) =>
		{
			this.state.usernameHistory = history;
			this.accountService.pushVault();
		});
	}


	// Generates a password.
	public generatePassword(): void
	{ this.state.password = this.generatorService.generate(); }


	// Opens the password history modal.
	public viewPasswordHistory(): void
	{
		this.viewHistory(this.state.passwordHistory, (history) =>
		{
			this.state.passwordHistory = history;
			this.accountService.pushVault();
		});
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
		this.viewHistory(this.state.noteHistory, (history) =>
		{
			this.state.noteHistory = history;
			this.accountService.pushVault();
		});
	}


	// Returns the vault's account entries.
	private getAccounts(): Record<string, Types.Account>
	{ return this.accountService.getVault().accounts; }


	// Appends the given entry to history if appropriate.
	private addToHistory(entry: string, history: Types.VaultEntryHistoryEntry[]): void
	{
		if(!entry) return;

		// Add the entry to history if it differs from the previous entry.
		if(history.length === 0 || history[0].entry !== entry)
			history.unshift({date: new Date(), entry});

		// If the number of entries exceeds the maximum allowed, remove the oldest entry.
		if(history.length > Settings.maximumHistoryEntries) history.pop();
	}


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
			this.stateService.vaultEntryHistoryModal.subject.subscribe(updateCallback);
	}


	// Sends the given message, pushes the vault, and exits.
	private pushAndExit(): void
	{
		this.accountService.pushVault();
		this.router.navigate(['/app', {outlets: {'vault': null}}],
			{skipLocationChange: true});
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
