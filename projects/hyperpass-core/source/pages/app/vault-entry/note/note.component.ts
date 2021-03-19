/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {Router} from '@angular/router';

import * as Types from '../../../../types';
import {VaultEntryBaseDirective} from '../vault-entry-base.directive';
import {UtilityService} from '../../../../services/utility.service';
import {AccountService} from '../../../../services/account.service';
import {MessageService} from '../../../../services/message.service';
import {ModalService} from '../../../../services/modal.service';


@Component
({
	selector: 'hyperpass-note',
	templateUrl: './note.component.html'
})

export class NoteComponent extends VaultEntryBaseDirective<Types.Note>
	implements OnInit, OnDestroy
{
	// Constructor.
	public constructor(router: Router, utilityService: UtilityService,
		messageService: MessageService, accountService: AccountService,
		modalService: ModalService)
	{
		super(accountService, router, utilityService, messageService,
			modalService, Types.defaultNote, 'Note');
	}


	// Initializer and destructor.
	public ngOnInit(): void { super.initialize(); }

	public ngOnDestroy(): void { super.destroy(); }


	// Virtual overrides.
	protected getEntries(): Record<string, Types.Note>
	{ return this.accountService.getVault().notes; }

	protected setEntries(entries: Record<string, Types.Note>): void
	{ this.accountService.getVault().notes = entries; }
}
