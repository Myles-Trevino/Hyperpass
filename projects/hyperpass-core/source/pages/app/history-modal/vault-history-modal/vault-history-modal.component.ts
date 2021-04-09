/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component} from '@angular/core';
import * as Ionic from '@ionic/angular';

import type * as Types from '../../../../types';
import {StateService} from '../../../../services/state.service';
import {MessageService} from '../../../../services/message.service';
import {AccountService} from '../../../../services/account.service';
import {UtilityService} from '../../../../services/utility.service';
import {PlatformService} from '../../../../services/platform.service';
import {HistoryModalBaseDirective} from '../history-modal-base.directive';


@Component
({
	selector: 'hyperpass-vault-history-modal',
	templateUrl: './vault-history-modal.component.html',
	styleUrls: ['../history-modal.component.scss']
})

export class VaultHistoryModalComponent extends
	HistoryModalBaseDirective<Types.VaultHistoryEntry>
{
	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		public readonly utilityService: UtilityService,
		protected readonly stateService: StateService,
		protected readonly messageService: MessageService,
		protected readonly ionicPlatform: Ionic.Platform,
		private readonly accountService: AccountService)
	{
		super(platformService, stateService, messageService, ionicPlatform,
			utilityService, stateService.vaultHistoryModal.history);
	}


	// Restores the given entry and pushes the vault.
	public restore(entry: Types.VaultHistoryEntry, index: number): void
	{
		try
		{
			// Restore the entry to the vault.
			const vault = this.accountService.getVault();

			vault.accounts = this.utilityService.uniqueAppend(
				{[entry.key]: entry.value}, vault.accounts);

			// Delete the entry from history.
			this.delete(index);

			// Push the vault and send a success message.
			this.accountService.pushVault();
			this.messageService.message('Account restored.');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Saves the history changes and pushes the vault.
	protected updateCallback(): void
	{
		this.accountService.getVault().history = this.history;
		this.accountService.pushVault();
		this.stateService.vaultHistoryModal.subject.next();
	}
}
