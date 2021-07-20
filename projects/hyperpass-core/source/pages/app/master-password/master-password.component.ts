/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as Ionic from '@ionic/angular';

import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';


@Component
({
	selector: 'hyperpass-master-password',
	templateUrl: './master-password.component.html'
})

export class MasterPasswordComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public newMasterPassword = '';
	public newMasterPasswordConfirmation = '';
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly ionicPlatform: Ionic.Platform){}


	// Initializer.
	public ngOnInit(): void
	{
		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(100, () => { this.utilityService.close('options'); });
	}


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Changes the master password.
	public async change(): Promise<void>
	{
		try
		{
			// Validate the master password.
			this.accountService.validateMasterPassword(
				this.newMasterPassword, this.newMasterPasswordConfirmation);

			// Change the master password.
			await this.accountService.changeMasterPassword(this.newMasterPassword);

			// Send a success message.
			this.messageService.message('Your master '+
				'password has been changed successfully.');

			// Return to the options page.
			this.utilityService.close('options');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
