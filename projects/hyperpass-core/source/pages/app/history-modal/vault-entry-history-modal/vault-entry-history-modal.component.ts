/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component} from '@angular/core';
import {NgIf, NgFor, NgClass} from '@angular/common';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import * as Ionic from '@ionic/angular';
import {NgScrollbar} from 'ngx-scrollbar';

import {Types} from 'builds/hyperpass-common';

import {StateService} from '../../../../services/state.service';
import {MessageService} from '../../../../services/message.service';
import {UtilityService} from '../../../../services/utility.service';
import {PlatformService} from '../../../../services/platform.service';
import {HistoryModalBaseDirective} from '../history-modal-base.directive';
import {SvgComponent} from '../../../../svg/svg.component';


@Component
({
	selector: 'hyperpass-vault-entry-history-modal',
	templateUrl: './vault-entry-history-modal.component.html',
	styleUrls: ['../history-modal.component.scss'],
	imports: [NgIf, NgScrollbar, NgFor, NgClass, SvgComponent, CdkCopyToClipboard]
})

export class VaultEntryHistoryModalComponent extends
	HistoryModalBaseDirective<Types.VaultEntryHistoryEntry>
{
	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		protected readonly stateService: StateService,
		protected readonly ionicPlatform: Ionic.Platform,
		public readonly messageService: MessageService,
		public readonly utilityService: UtilityService)
	{
		super(platformService, stateService, messageService, ionicPlatform,
			utilityService, stateService.vaultEntryHistoryModal.history,
			stateService.vaultEntryHistoryModal);
	}

	// Update callback.
	public updateCallback(): void
	{
		this.stateService.vaultEntryHistoryModalSubject.next(this.history);
	}
}
