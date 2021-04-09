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
import {GeneratorService} from '../../../services/generator.service';
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
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		private readonly accountService: AccountService,
		private readonly generatorService: GeneratorService,
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
	public async change(newMasterPasswordConfirmation: string): Promise<void>
	{
		try
		{
			// Validate the master password.
			this.accountService.validateMasterPassword(
				this.newMasterPassword, newMasterPasswordConfirmation);

			// Change the master password.
			await this.accountService.changeMasterPassword(this.newMasterPassword);

			// Send a success message and return to the settings page.
			this.messageService.message('Your master '+
				'password has been successfully changed.');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Generates a master password.
	public generateMasterPassword(): void
	{ this.newMasterPassword = this.generatorService.generate(); }
}
