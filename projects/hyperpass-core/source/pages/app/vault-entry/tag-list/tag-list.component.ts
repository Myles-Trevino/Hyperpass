/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, EventEmitter, Input, Output, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';

import * as Types from '../../../../types';
import {MessageService} from '../../../../services/message.service';
import {ModalService} from '../../../../services/modal.service';
import {AccountService} from '../../../../services/account.service';
import {UtilityService} from '../../../../services/utility.service';


@Component
({
	selector: 'hyperpass-tag-list',
	templateUrl: './tag-list.component.html',
	styleUrls: ['./tag-list.component.scss']
})

export class TagListComponent implements OnInit, OnDestroy
{
	@Input() public tags?: string[];
	@Output() public readonly tagsChange = new EventEmitter<string[]>();
	@Output() public readonly pushTags = new EventEmitter();
	@Output() public readonly pullTags = new EventEmitter();
	@HostBinding('class') public readonly class = 'tile-setting';

	public vault: Types.Vault = Types.defaultVault;
	private modalSubscription?: Subscription;


	// Constructor.
	public constructor(private readonly messageService: MessageService,
		private readonly accountService: AccountService,
		private readonly utilityService: UtilityService,
		private readonly modalService: ModalService){}


	// Initializer.
	public ngOnInit(): void { this.updateTags(true); }


	// Destructor.
	public ngOnDestroy(): void { this.modalSubscription?.unsubscribe(); }


	// Removes the given tag.
	public remove(tag: string): void
	{
		if(!this.tags) throw new Error('The tag list does not exist.');
		const index = this.tags.indexOf(tag);
		if(index < 0) throw new Error('Could not remove the tag.');
		this.tags.splice(index, 1);
		this.pushTags.emit();
	}


	// Opens the tags modal.
	public add(): void
	{
		// Open the tags modal.
		this.modalSubscription?.unsubscribe();
		this.modalService.open('Tags');

		// Update the tags when appropriate.
		this.modalSubscription = this.modalService.tagsSubject.subscribe((tag) =>
		{
			try
			{
				// If no tag was given, pull changes from the the vault.
				if(!tag) this.pullTags.emit();

				// If a tag was given, add it and push the changes to the vault.
				else
				{
					if(!this.tags) throw new Error('The tags were not provided.');

					if(this.tags.includes(tag))
						throw new Error('This tag has already been added.');

					this.tags.push(tag);
					this.pushTags.emit();
				}
			}

			// Handle errors.
			catch(error: unknown){ this.messageService.error(error as Error); }
		});
	}


	// Opens the tags modal in tag edit mode.
	public async edit(key: string, index: number): Promise<void>
	{
		if(index === 0) return; // Do not edit reserved tags.

		// Open the tags modal and pass it the key of the tag to be edited.
		this.modalSubscription?.unsubscribe();
		this.modalService.open('Tags');
		await this.utilityService.sleep();
		this.modalService.tagsSubject.next(key);

		// Update the tags when appropriate.
		this.modalSubscription = this.modalService.tagsSubject
			.subscribe(() => { this.updateTags(); });
	}


	// Update.
	private updateTags(initial = false): void
	{
		this.vault = this.accountService.getVault();
		if(!initial) this.pullTags.emit();
	}
}
