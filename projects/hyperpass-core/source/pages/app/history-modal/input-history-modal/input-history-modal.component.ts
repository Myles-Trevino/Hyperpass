/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component} from '@angular/core';

import type * as Types from '../../../../types';
import {ModalService} from '../../../../services/modal.service';
import {MessageService} from '../../../../services/message.service';
import {UtilityService} from '../../../../services/utility.service';
import {HistoryModalBaseDirective} from '../history-modal-base.directive';


@Component
({
	selector: 'hyperpass-input-history-modal',
	templateUrl: './input-history-modal.component.html',
	styleUrls: ['../history-modal.component.scss']
})

export class InputHistoryModalComponent extends
	HistoryModalBaseDirective<Types.InputHistoryEntry> implements OnInit, OnDestroy
{
	// Constructor.
	public constructor(protected readonly modalService: ModalService,
		public readonly messageService: MessageService,
		public readonly utilityService: UtilityService)
	{ super(modalService, messageService); }


	// Initializer.
	public ngOnInit(): void { this.subscribe(this.modalService.inputHistorySubject); }

	// Destructor.
	public ngOnDestroy(): void { this.unsubscribe(); }
}
