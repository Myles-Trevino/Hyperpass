/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Animations from '../../../animations';
import {AccountService} from '../../../services/account.service';
import {ModalService} from '../../../services/modal.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';


@Component
({
	selector: 'hyperpass-tags-modal',
	templateUrl: './tags-modal.component.html',
	styleUrls: ['./tags-modal.component.scss'],
	animations: [Animations.fadeInAnimation]
})

export class TagsModalComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-modal';

	public readonly reservedTags = Types.reservedTags;
	public readonly tagColors = Types.tagColors;
	public vault: Types.Vault = Types.defaultVault;
	public hasTags = false;
	public key = '';
	public tag = Types.defaultTag;
	public name = '';

	private subscription?: Subscription;
	private singleEditMode = false;


	public constructor(public readonly modalService: ModalService,
		private readonly accountService: AccountService,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Load the vault.
		this.vault = _.cloneDeep(this.accountService.getVault());
		this.updateHasTags();

		// If a tag key was passed, enter single edit mode.
		this.subscription = this.modalService.tagsSubject.subscribe((key) =>
		{
			this.subscription?.unsubscribe();

			if(key)
			{
				this.singleEditMode = true;
				this.edit(key);
			}
		});
	}


	// Destructor.
	public ngOnDestroy(): void { this.subscription?.unsubscribe(); }


	// Returns the given tag and exits.
	public returnTag(key: string): void
	{
		this.modalService.tagsSubject.next(key);
		this.modalService.close();
	}


	// Adds a new tag.
	public new(): void
	{
		// Generate a unique key.
		let key = 'New Tag';
		let enumerator = 2;

		while(this.vault.tags.hasOwnProperty(key))
		{
			key = `New Tag ${enumerator}`;
			++enumerator;
		}

		// Add the tag.
		this.vault.tags[key] = Types.defaultTag;
		this.updateVault();

		// Scroll the tag into view.
		this.scrollTo(key);
	}


	// Deletes the given tag.
	public delete(key: string): void
	{
		// Delete the tag.
		delete this.vault.tags[key];

		// Remove the tag from all vault entries.
		this.replaceTag(key);

		// Update.
		this.updateVault();
		this.modalService.tagsSubject.next();
	}


	// Loads the given tag for editing.
	public edit(key: string): void
	{
		this.key = key;
		this.name = key;
		this.tag = _.cloneDeep(this.vault.tags[key]);
	}


	// Saves the tag being currently edited.
	public save(): void
	{
		try
		{
			// Validate.
			if(!this.name) throw new Error('Please enter a tag name.');

			if(this.name !== this.key && this.vault.tags.hasOwnProperty(this.name))
				throw new Error('A tag with this name already exists.');

			// Replace the old tag with the new one.
			delete this.vault.tags[this.key];
			this.vault.tags[this.name] = this.tag;
			this.replaceTag(this.key, this.name);

			// Update.
			this.updateVault();
			this.modalService.tagsSubject.next();

			// Return.
			this.exitEditing();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Turns the given tag key into its corresponding HTML ID.
	public getId(key: string): string { return key.toLowerCase().replace(/ /g, '-'); }


	// Returns from the editing screen.
	public exitEditing(): void
	{
		const key = this.key;

		// Reset the key.
		this.key = '';
		this.name = '';
		this.tag = _.cloneDeep(Types.defaultTag);

		// If in single edit mode, exit.
		if(this.singleEditMode) this.modalService.close();

		// Scroll to the tag that was being edited.
		this.scrollTo(key, false);
	}


	// Updates whether there are displayable tags.
	private updateHasTags(): void
	{ this.hasTags = Object.keys(this.vault.tags).length > Types.reservedTags.length; }


	// Removes the given tag from all vault entries
	// and replaces it with the given replacement.
	private replaceTag(tagKey: string, replacementTagKey?: string): void
	{
		this.replaceTagSubset(tagKey, this.vault.accounts, replacementTagKey);
		this.replaceTagSubset(tagKey, this.vault.cards, replacementTagKey);
		this.replaceTagSubset(tagKey, this.vault.notes, replacementTagKey);
	}


	// Removes the given tag from the given vault entries
	// and replaces it with the given replacement.
	private replaceTagSubset<T extends Types.VaultEntry>(tagKey: string,
		entries: Record<string, T>, replacementTagKey?: string): void
	{
		for(const [entryKey, entry] of Object.entries(entries))
		{
			for(const tag of entry.tags)
			{
				// If the tag does not match the specified one, skip it.
				if(tag !== tagKey) continue;

				// Remove the tag.
				const index = entries[entryKey].tags.indexOf(tagKey);
				if(index <= -1) throw new Error('Failed to retrieve a tag\'s index.');
				entries[entryKey].tags.splice(index, 1);

				// Add the new tag if it was given.
				if(replacementTagKey) entries[entryKey].tags.push(replacementTagKey);
			}
		}
	}


	// Scrolls the tag with the given key into view.
	private async scrollTo(key: string, smooth = true): Promise<void>
	{
		// Wait for the content to load.
		await this.utilityService.sleep();

		// Scroll the tag into view.
		document.getElementById(this.getId(key))?.scrollIntoView(
			{block: 'center', behavior: smooth ? 'smooth' : 'auto'});
	}


	// Updates that vault's tags and pushes the vault.
	private updateVault(): void
	{
		const vault = this.accountService.getVault();
		vault.tags = this.vault.tags;
		vault.accounts = this.vault.accounts;
		vault.cards = this.vault.cards;
		vault.notes = this.vault.notes;

		this.accountService.pushVault();
		this.updateHasTags();
	}
}
