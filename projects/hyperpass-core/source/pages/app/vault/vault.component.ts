/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, HostBinding, ChangeDetectorRef, ViewChild} from '@angular/core';
import {NgClass, NgIf, NgFor} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {IonicModule} from '@ionic/angular';
import {NgScrollbar} from 'ngx-scrollbar';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import {Types, Utilities} from 'builds/hyperpass-common';

import * as Animations from '../../../animations';
import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {StateService} from '../../../services/state.service';
import {AutofocusDirective} from '../../../autofocus.directive';
import {SvgComponent} from '../../../svg/svg.component';
import {TagColorComponent} from '../tag-color/tag-color.component';


type Entry =
{
	key: string;
	tags: string[];
	username: string;
	url: string;
};


@Component
({
	selector: 'hyperpass-vault',
	templateUrl: './vault.component.html',
	styleUrls: ['./vault.component.scss'],
	animations: [Animations.fadeInAnimation,
		Animations.delayedFadeInAnimation],
	imports: [FormsModule, AutofocusDirective, SvgComponent, NgClass, RouterLink, IonicModule, NgIf, NgScrollbar, NgFor, TagColorComponent, CdkCopyToClipboard]
})

export class VaultComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;

	public state: Types.VaultState = _.clone(Types.defaultVaultState);
	public entries: Entry[] = [];
	public pageEntries: Entry[] = [];
	public pageCount = 1;
	public vault: Types.Vault = _.clone(Types.defaultVault);
	public loading = true;

	private readonly pageSize = 30;
	private modalSubscription?: Subscription;
	private updateSubscription?: Subscription;
	private scrollbarSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		public readonly stateService: StateService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.state = this.stateService.vault;

		// Regenerate the page on vault updates.
		this.updateSubscription = this.stateService
			.updateVaultSubject.subscribe(() => { this.generatePage(); });

		// Generate the page.
		this.generatePage();
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.updateSubscription?.unsubscribe();
		this.modalSubscription?.unsubscribe();
		this.scrollbarSubscription?.unsubscribe();
	}

	// Blocks the given mouse event from propagating to the tile and sends a copy message.
	public tileButtonClickCallback(event: MouseEvent, name: string): void
	{
		event.stopPropagation();
		this.messageService.message(`${name} copied.`, 2);
	}


	// Scrolls the tag container horizontally on mouse wheel events.
	public tagContainerScrollCallback(event: WheelEvent): void
	{
		// If the tag container is not scrollable, return.
		if(!event.target) return;
		const tagContainer = (event.target as Element);
		if(tagContainer.scrollWidth <= tagContainer.clientWidth) return;

		// Scroll the tag container horizontally.
		event.preventDefault();
		tagContainer.scrollBy(event.deltaY/3, 0);
	}


	// Opens the vault history modal.
	public openVaultHistoryModal(): void
	{
		// Open the modal.
		this.stateService.vaultHistoryModal.history = this.vault.history;
		this.stateService.openModal('Vault History');

		// Bind the callback.
		this.modalSubscription?.unsubscribe();
		this.modalSubscription = this.stateService.vaultHistoryModalSubject
			.subscribe(() => { this.generatePage(); });
	}


	// Navigates to the previous page.
	public previousPage(): void
	{
		--this.state.page;
		this.state.scrollPosition = 0;
		this.generatePage();
	}


	// Navigates to the next page.
	public nextPage(): void
	{
		++this.state.page;
		this.state.scrollPosition = 0;
		this.generatePage();
	}


	// Generates the page.
	public async generatePage(query?: string, newQuery = false): Promise<void>
	{
		try
		{
			this.loading = true;
			this.changeDetectorRef.detectChanges();
			this.vault = _.cloneDeep(this.accountService.getVault());

			// Update the state on new queries.
			if(newQuery)
			{
				this.state.query = query;
				this.state.page = 1;
				this.state.scrollPosition = 0;
			}

			// Parse the query.
			const queryParts: Types.QueryPart[] = [];
			if(this.state.query)
			{
				const queryTokens = this.state.query.toLowerCase()
					.split(/(?=username:)|(?=url:)|(?=tag:)/);

				queryTokens.forEach((token) =>
				{
					if(!token) return;
					token = token.trim();
					let modifier: Types.QueryModifier | undefined = undefined;

					for(const queryModifier of Types.queryModifiers)
						if(token.startsWith(queryModifier))
						{
							modifier = queryModifier;
							token = token.substring(queryModifier.length);
						}

					queryParts.push({modifier, string: token});
				});
			}

			// Generate the entries list.
			this.entries = [];
			for(const [key, value] of Object.entries(this.vault.accounts))
			{
				// If the entry does not satisfy a query, skip it.
				let matches = true;
				for(const queryPart of queryParts)
					if(!this.matchesQuery(key, value, queryPart)){ matches = false; break; }

				if(!matches) continue;

				// Otherwise, add the entry.
				this.entries.push({key, tags: value.tags,
					username: value.username, url: value.url});
			}

			this.entries = Utilities.naturalSort(this.entries, (entry) => entry.key);

			// Get the page entries.
			this.pageCount = Math.floor(this.entries.length/this.pageSize)+1;
			const startIndex = this.pageSize*(this.state.page-1);
			this.pageEntries = this.entries.slice(startIndex, startIndex+this.pageSize);

			this.loading = false;

			// Initialize the scrollbar.
			this.changeDetectorRef.detectChanges();
			this.scrollbarSubscription = await this.stateService
				.initializeScrollbar(this.state, this.scrollbar);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Returns whether the given entry matches the given queries.
	private matchesQuery(entryName: string,
		entry: Types.Account, queryPart: Types.QueryPart): boolean
	{
		switch(queryPart.modifier)
		{

			// Username.
			case 'username:': return entry.username.toLowerCase().includes(queryPart.string);

			// URL.
			case 'url:': return entry.url.toLowerCase().includes(queryPart.string);

			// Tag.
			case 'tag:':
				for(const tagKey of entry.tags)
				{
					const tagName = this.vault.tags[tagKey].name;
					if(tagName.toLowerCase().includes(queryPart.string)) return true;
				}

				return false;

			// Regular.
			default: return entryName.toLowerCase().includes(queryPart.string);
		}
	}
}
