/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import * as Ionic from '@ionic/angular';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Animations from '../../../animations';
import {AccountService} from '../../../services/account.service';
import {StateService} from '../../../services/state.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {PlatformService} from '../../../services/platform.service';


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

	public readonly tagColors = Types.tagColors;
	public vault: Types.Vault = Types.defaultVault;
	public hasTags = false;
	public key = '';
	public tag = Types.defaultTag;
	private singleEditMode = false;
	private backButtonSubscription?: Subscription;


	public constructor(public readonly stateService: StateService,
		public readonly platformService: PlatformService,
		private readonly accountService: AccountService,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		protected readonly ionicPlatform: Ionic.Platform){}


	// Initializer.
	public ngOnInit(): void
	{
		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(101, () => { this.stateService.closeModals(); });

		// Load the vault.
		this.vault = _.cloneDeep(this.accountService.getVault());
		this.updateHasTags();

		// If a single edit key was specified, enter single edit mode.
		if(this.stateService.tagsModal.singleEditTag)
		{
			this.singleEditMode = true;
			this.edit(this.stateService.tagsModal.singleEditTag);
		}
	}


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Returns the given tag and exits.
	public returnTag(key: string): void
	{
		this.stateService.tagsModal.subject.next({type: 'Select', tag: key});
		this.stateService.closeModals();
	}


	// Adds a new tag.
	public new(): void
	{
		// Add the tag.
		const key = uuidv4();
		const name = this.utilityService.generateUniqueName('New Tag', this.vault.tags,
			(_name, entries) => Object.values(entries).some((e) => e.name === _name));

		this.vault.tags[key] = {name, color: 'None'};
		this.updateVault();

		// Scroll the tag into view.
		this.scrollTo(key);
	}


	// Deletes the given tag.
	public delete(key: string): void
	{
		// Delete the tag.
		delete this.vault.tags[key];
		this.replaceTag(key);

		// Update.
		this.updateVault();
		this.stateService.tagsModal.subject.next({type: 'Delete', tag: key});
	}


	// Loads the given tag for editing.
	public edit(key: string): void
	{
		this.key = key;
		this.tag = _.cloneDeep(this.vault.tags[key]);
	}


	// Saves the tag being currently edited.
	public save(): void
	{
		try
		{
			// Validate.
			if(!this.tag.name) throw new Error('Please enter a tag name.');

			if(Object.entries(this.vault.tags).some(([k, v]) =>
				(k !== this.key) && (v.name === this.tag.name)))
				throw new Error('A tag with this name already exists.');

			// Update.
			this.vault.tags[this.key] = this.tag;
			this.updateVault();

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
		this.tag = _.cloneDeep(Types.defaultTag);

		// If in single edit mode, exit.
		if(this.singleEditMode)
		{
			this.stateService.tagsModal.singleEditTag = undefined;
			this.stateService.closeModals();
		}

		// Scroll to the tag that was being edited.
		this.scrollTo(key, false);
	}


	// Updates whether there are displayable tags.
	private updateHasTags(): void
	{ this.hasTags = Object.keys(this.vault.tags).length > 0; }


	// Removes the given tag from the given accounts.
	private replaceTag(key: string): void
	{
		for(const [entryKey, entry] of Object.entries(this.vault.accounts))
		{
			for(const tag of entry.tags)
			{
				// If the tag does not match the specified one, skip it.
				if(tag !== key) continue;

				// Remove the tag.
				const index = this.vault.accounts[entryKey].tags.indexOf(key);
				if(index <= -1) throw new Error('Failed to retrieve a tag\'s index.');
				this.vault.accounts[entryKey].tags.splice(index, 1);
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
		this.accountService.pushVault();
		this.updateHasTags();
	}
}
