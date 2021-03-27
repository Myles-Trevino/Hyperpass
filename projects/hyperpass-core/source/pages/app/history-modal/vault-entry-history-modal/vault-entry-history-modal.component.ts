/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component} from '@angular/core';

import type * as Types from '../../../../types';
import {StateService} from '../../../../services/state.service';
import {MessageService} from '../../../../services/message.service';
import {UtilityService} from '../../../../services/utility.service';
import {HistoryModalBaseDirective} from '../history-modal-base.directive';


@Component
({
	selector: 'hyperpass-vault-entry-history-modal',
	templateUrl: './vault-entry-history-modal.component.html',
	styleUrls: ['../history-modal.component.scss']
})

export class VaultEntryHistoryModalComponent extends
	HistoryModalBaseDirective<Types.VaultEntryHistoryEntry>
{
	// Constructor.
	public constructor(protected readonly stateService: StateService,
		public readonly messageService: MessageService,
		public readonly utilityService: UtilityService)
	{
		super(stateService, messageService, stateService.vaultEntryHistoryModal.history);
	}
}
