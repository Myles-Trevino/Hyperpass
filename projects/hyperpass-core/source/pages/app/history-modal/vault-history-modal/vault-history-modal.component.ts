/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component} from '@angular/core';

import type * as Types from '../../../../types';
import {ModalService} from '../../../../services/modal.service';
import {MessageService} from '../../../../services/message.service';
import {AccountService} from '../../../../services/account.service';
import {UtilityService} from '../../../../services/utility.service';
import {HistoryModalBaseDirective} from '../history-modal-base.directive';


@Component
({
	selector: 'hyperpass-vault-history-modal',
	templateUrl: './vault-history-modal.component.html',
	styleUrls: ['../history-modal.component.scss']
})

export class VaultHistoryModalComponent extends
	HistoryModalBaseDirective<Types.VaultHistoryEntry> implements OnInit, OnDestroy
{
	// Constructor.
	public constructor(protected readonly modalService: ModalService,
		protected readonly messageService: MessageService,
		public readonly utilityService: UtilityService,
		private readonly accountService: AccountService)
	{ super(modalService, messageService); }


	// Initializer.
	public ngOnInit(): void { this.subscribe(this.modalService.vaultHistorySubject); }


	// Destructor.
	public ngOnDestroy(): void { this.unsubscribe(); }


	// Restores the given entry and pushes the vault.
	public restore(entry: Types.VaultHistoryEntry, index: number): void
	{
		try
		{
			const vault = this.accountService.getVault();

			if(entry.type === 'Account') vault.accounts = this.utilityService.
				uniqueAppend({test: entry.entry as Types.Account}, vault.accounts);

			else if(entry.type === 'Card') vault.cards = this.utilityService.
				uniqueAppend({test: entry.entry as Types.Card}, vault.cards);

			else vault.notes = this.utilityService.uniqueAppend(
				{test: entry.entry as Types.Note}, vault.notes);

			this.delete(index);
			this.accountService.pushVault();
			this.messageService.message(`${entry.type} restored.`);
		}

		// Handle error.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Saves the history changes and pushes the vault.
	protected updateCallback(): void
	{
		this.accountService.getVault().history = this.history;
		this.accountService.pushVault();
	}
}
