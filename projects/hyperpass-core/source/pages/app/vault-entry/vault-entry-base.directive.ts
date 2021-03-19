/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Input, Directive} from '@angular/core';
import {Router} from '@angular/router';
import type {Subscription} from 'rxjs';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

import type * as Types from '../../../types';
import {UtilityService} from '../../../services/utility.service';
import {MessageService} from '../../../services/message.service';
import {AccountService} from '../../../services/account.service';
import {ModalService} from '../../../services/modal.service';


// @dynamic
@Directive()
export abstract class VaultEntryBaseDirective<T extends Types.VaultEntry>
{
	@Input() public events?: Subject<string>;

	public state: T;
	public title = '';

	private readonly typeName?: 'Account'|'Card'|'Note';
	private saveSubscription?: Subscription;
	private historySubscription?: Subscription;
	private key?: string;


	// Constructor.
	public constructor(protected readonly accountService: AccountService,
		private readonly router: Router,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		private readonly modalService: ModalService,
		state: T, typeName: 'Account'|'Card'|'Note')
	{
		this.state = _.cloneDeep(state);
		this.typeName = typeName;
	}


	// Opens the note history modal.
	public viewNoteHistory(): void
	{
		this.viewHistory(this.state.noteHistory, (history) =>
		{
			this.getSelf().noteHistory = history;
			this.state.noteHistory = history;
			this.accountService.pushVault();
		});
	}


	// Pushes the tags to the vault.
	public pushTags(): void
	{
		if(!this.key) throw new Error('The key was not provided.');
		this.getEntries()[this.key].tags = this.state.tags;
		this.accountService.pushVault();
	}


	// Pulls the tags from the vault.
	public pullTags(): void
	{
		if(!this.key) throw new Error('The key was not provided.');
		this.state.tags = _.cloneDeep(this.getEntries()[this.key].tags);
	}


	// Virtuals.
	protected getEntries(): Record<string, T> { return {}; }
	protected setEntries(entries: Record<string, T>): void { /* Virtual. */ }
	protected saveCallback(entry: T): void { /* Virtual. */ }
	protected deleteCallback(entry: T): void { /* Virtual. */ }
	protected updateHistory(): void { /* Virtual. */ }


	// Initializer.
	protected initialize(): void
	{
		// Subscribe.
		if(!this.events) throw new Error('The events subject was not provided.');

		this.saveSubscription = this.events.subscribe(
			(type) => { if(type === 'save') this.save(); else this.delete(); });

		// If a key was given, load that entry's state.
		this.key = this.utilityService.loadUrlParameter('key');

		if(this.key)
		{
			this.title = this.key;
			this.state = _.cloneDeep(this.getEntries()[this.key]);
		}
	}


	// Destructor.
	protected destroy(): void
	{
		this.saveSubscription?.unsubscribe();
		this.historySubscription?.unsubscribe();
	}


	// Appends the given entry to input history if appropriate.
	protected addToHistory(entry: string, history: Types.InputHistoryEntry[]): void
	{
		if(!entry) return;

		// Add the entry to input history if it differs from the previous entry.
		if(history.length === 0 || history[history.length-1].entry !== entry)
			history.unshift({date: new Date(), entry});

		// If there are over 10 entries, remove the oldest entry.
		if(history.length > 10) history.shift();
	}


	// Opens the history modal for the given input history entries.
	protected async viewHistory(history: Types.InputHistoryEntry[],
		updateCallback: (updatedHistory: Types.InputHistoryEntry[]) => void): Promise<void>
	{
		// Open the history modal.
		this.historySubscription?.unsubscribe();
		this.modalService.open('Input History');
		await this.utilityService.sleep();
		this.modalService.inputHistorySubject.next(history);

		// Update the history if appropriate.
		this.historySubscription = this.modalService.inputHistorySubject.subscribe(
			(result) => { updateCallback(result); });
	}


	// Returns the entry's own vault entry.
	protected getSelf(): T
	{
		if(!this.key) throw new Error('No key was provided.');
		return this.getEntries()[this.key];
	}


	// Saves the account, pushes the vault, and exits.
	private save(): void
	{
		try
		{
			// Validate.
			if(!this.title) throw new Error('Please enter a title.');

			this.saveCallback(this.state);

			if(this.state.note && this.state.note.length > 3000) throw new Error(
				'Notes are limited to 3000 characters. Please shorten your note.');

			if(!this.typeName) throw new Error('No typename');
			const entries = this.getEntries();

			if(this.title !== this.key && entries.hasOwnProperty(this.title))
				throw new Error(`Another ${
					this.typeName.toLowerCase()} already has this title.`);

			// If the entry exists, update it.
			if(this.key)
			{
				if(!entries.hasOwnProperty(this.key))
					throw new Error(`Failed to update the ${this.typeName.toLowerCase()}.`);

				delete entries[this.key];
				entries[this.title] = this.state;
			}

			// Otherwise, create a new entry.
			else
			{
				if(Object.keys(entries).length > 10000) throw new Error('The number of '+
					'vault entries is limited to 10,000. Please remove any unneeded '+
					'entries and try again.');

				entries[this.title] = this.state;
			}

			// Update the history.
			this.updateHistory();
			this.addToHistory(this.state.note, this.state.noteHistory);

			// Update the vault.
			this.pushAndExit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Adds the entry to vault history, deletes it from the vault, and exits.
	private delete(): void
	{
		try
		{
			if(!this.key || !this.typeName) return;

			this.deleteCallback(this.state);

			// Add the entry to history.
			const vault = this.accountService.getVault();

			vault.history.unshift({type: this.typeName,
				key: this.key, entry: this.state, date: new Date()});

			if(vault.history.length > 10) vault.history.pop();

			// Delete.
			const entries = this.getEntries();
			if(this.key) delete entries[this.key];

			// Push the vault and exit.
			this.pushAndExit();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Sends the given message, pushes the vault, and exits.
	private pushAndExit(): void
	{
		this.accountService.pushVault();
		this.router.navigate(['/app', {outlets: {'vault': null}}],
			{skipLocationChange: true});
	}
}
