/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, HostBinding, ChangeDetectorRef, ViewChild} from '@angular/core';
import {SimplebarAngularComponent} from 'simplebar-angular';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Animations from '../../../animations';
import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {ModalService} from '../../../services/modal.service';
import {UtilityService} from '../../../services/utility.service';
import {StateService} from '../../../services/state.service';


type Entry =
{
	key: string;
	type: string;
	tags: string[];
	preview: string;
};


@Component
({
	selector: 'hyperpass-vault',
	templateUrl: './vault.component.html',
	styleUrls: ['./vault.component.scss'],
	animations: [Animations.fadeInAnimation,
		Animations.delayedFadeInAnimation]
})

export class VaultComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('simpleBar') private readonly simpleBar?: SimplebarAngularComponent;

	private readonly pageSize = 30;

	public entries: Entry[] = [];
	public pageEntries: Entry[] = [];
	public pageCount = 1;
	public vault: Types.Vault = Types.defaultVault;
	public loading = true;

	private historyModalSubscription?: Subscription;
	private updateSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		public readonly modalService: ModalService,
		public readonly stateService: StateService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Regenerate the page on vault updates.
		this.updateSubscription = this.utilityService
			.updateVaultSubject.subscribe(() => { this.generatePage(); });

		// Generate the page.
		this.generatePage();
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.updateSubscription?.unsubscribe();
		this.historyModalSubscription?.unsubscribe();
	}


	// Blocks the given mouse event and sends a copy message.
	public clickCallback(event: MouseEvent, name: string): void
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
	public async openVaultHistoryModal(): Promise<void>
	{
		// Open the modal.
		this.historyModalSubscription?.unsubscribe();
		this.modalService.open('Vault History');
		await this.utilityService.sleep();
		this.modalService.vaultHistorySubject.next(this.vault.history);

		// Update the vault if necessary.
		this.historyModalSubscription = this.modalService
			.vaultHistorySubject.subscribe(() => { this.generatePage(); });
	}


	// Navigates to the previous page.
	public previousPage(): void
	{
		--this.stateService.vault.page;
		this.stateService.vault.scrollPosition = 0;
		this.generatePage();
	}


	// Navigates to the next page.
	public nextPage(): void
	{
		++this.stateService.vault.page;
		this.stateService.vault.scrollPosition = 0;
		this.generatePage();
	}


	// Generates the page.
	public generatePage(query?: string): void
	{
		this.loading = true;
		this.changeDetectorRef.detectChanges();
		this.vault = _.cloneDeep(this.accountService.getVault());

		// Parse the query.
		const queries: string[] = [];
		const tagQueries: string[] = [];

		if(query)
		{
			this.stateService.vault.query = query;
			const queryTokens = query.split(' ');
			queryTokens.forEach((token, index) =>
			{
				token = token.trim();
				queryTokens[index] = token;

				// Tag queries.
				if(token.startsWith('tag:'))
					for(const tagQuery of token.substring(4).split(','))
						tagQueries.push(tagQuery.toLowerCase());

				// Normal queries.
				else queries.push(token.toLowerCase());
			});
		}

		// Generate the entries list.
		this.entries = [];

		this.addEntries(this.vault.accounts,
			(e) => e.username, 'Account', queries, tagQueries);
		this.addEntries(this.vault.cards,
			(e) => e.cardNumber, 'Card', queries, tagQueries);
		this.addEntries(this.vault.notes,
			(e) => e.note.substring(0, 256), 'Note', queries, tagQueries);

		this.entries = this.utilityService.naturalSort(this.entries, (entry) => entry.key);

		// Get the page entries.
		if(query) this.stateService.vault.page = 1;
		this.pageCount = Math.floor(this.entries.length/this.pageSize)+1;
		const startIndex = this.pageSize*(this.stateService.vault.page-1);
		this.pageEntries = this.entries.slice(startIndex, startIndex+this.pageSize);

		this.loading = false;
		this.changeDetectorRef.detectChanges();

		// Initialize SimpleBar.
		this.stateService.initializeSimpleBar(this.stateService.vault, this.simpleBar);
	}


	// Adds the appropriate entries from the given subset to the tag groups record.
	private addEntries<T extends Types.VaultEntry>(
		entries: Record<string, T>, getPreviewCallback: (element: T) => string,
		type: string, queries?: string[], tagQueries?: string[]): void
	{
		// For each entry...
		for(const [key, value] of Object.entries(entries))
		{
			// If the entry does not satisfy the query, skip it.
			if(queries && tagQueries)
			{
				let matches = true;

				// Tag queries.
				for(const tagQuery of tagQueries)
				{
					let tagMatches = false;
					for(const tag of value.tags)
						if(tag.toLowerCase().includes(tagQuery)){ tagMatches = true; break; }

					if(!tagMatches){ matches = false; break; }
				}

				// Regular queries.
				for(const query of queries)
					if(!key.toLowerCase().includes(query)){ matches = false; break; }

				if(!matches) continue;
			}

			// Otherwise, add the entry.
			this.entries.push({key, type, tags: value.tags,
				preview: getPreviewCallback(value)});
		}
	}
}
