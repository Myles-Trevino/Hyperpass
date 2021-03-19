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
	selector: 'hyperpass-card',
	templateUrl: './card.component.html'
})

export class CardComponent extends VaultEntryBaseDirective<Types.Card>
	implements OnInit, OnDestroy
{
	// Constructor.
	public constructor(router: Router, utilityService: UtilityService,
		messageService: MessageService, accountService: AccountService,
		modalService: ModalService)
	{
		super(accountService, router, utilityService, messageService,
			modalService, Types.defaultCard, 'Card');
	}


	// Initializer and destructor.
	public ngOnInit(): void { super.initialize(); }

	public ngOnDestroy(): void { super.destroy(); }


	// Virtual overrides.
	protected validate(state: Types.Card): void
	{
		// Check that a card number was entered.
		if(!state.cardNumber) throw new Error('Please enter the card number.');

		// Check that the security code is 3 or 4 digits.
		if(state.securityCode && !/^(\d){3,4}$/.test(state.securityCode))
			throw new Error('Invalid security code. The '+
				'security code must be 3 or 4 digits.');

		// Check that the expiry date is in MM/YY format.
		if(state.expirationDate && !/^\d\d\/\d\d$/.test(state.expirationDate))
			throw new Error('Invalid expiry date. The date must be in MM/YY format.');
	}

	protected getEntries(): Record<string, Types.Card>
	{ return this.accountService.getVault().cards; }

	protected setEntries(entries: Record<string, Types.Card>): void
	{ this.accountService.getVault().cards = entries; }
}
