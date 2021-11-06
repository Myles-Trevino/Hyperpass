/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, Input, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import {Types} from 'builds/hyperpass-common';

import {MessageService} from '../../../../services/message.service';
import {StateService} from '../../../../services/state.service';
import {AccountService} from '../../../../services/account.service';


@Component
({
	selector: 'hyperpass-tag-list',
	templateUrl: './tag-list.component.html',
	styleUrls: ['./tag-list.component.scss']
})

export class TagListComponent implements OnInit, OnDestroy
{
	@Input() public tags?: string[];
	@HostBinding('class') public readonly class = 'wide-tile-setting';

	public vault: Types.Vault = _.clone(Types.defaultVault);
	private modalSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly stateService: StateService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void { this.vault = this.accountService.getVault(); }


	// Destructor.
	public ngOnDestroy(): void { this.modalSubscription?.unsubscribe(); }


	// Adds the given tag.
	public add(tag: string): void
	{
		if(!this.tags) throw new Error('The tag list does not exist.');

		if(this.tags.includes(tag))
			throw new Error('This tag has already been added.');

		this.tags.push(tag);
	}


	// Removes the given tag.
	public remove(tag: string): void
	{
		if(!this.tags) throw new Error('The tag list does not exist.');

		const index = this.tags.indexOf(tag);
		if(index < 0) return;

		this.tags.splice(index, 1);
	}


	// Opens the tags modal.
	public openTagsModal(tag?: string): void
	{
		// Open the modal.
		this.stateService.tagsModal.singleEditTag = tag;
		this.stateService.openModal('Tags');

		// Bind the event callback.
		this.modalSubscription?.unsubscribe();
		this.modalSubscription = this.stateService.tagsModalSubject
			.subscribe((event) => { this.tagsModalCallback(event); });
	}


	// Tags modal callback.
	public tagsModalCallback(event: Types.TagsModalEvent): void
	{
		try
		{
			if(event.type === 'Select') this.add(event.tag);
			else this.remove(event.tag);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
