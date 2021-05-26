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
import {ApiService} from '../../../services/api.service';
import {UtilityService} from '../../../services/utility.service';


@Component
({
	selector: 'hyperpass-email-address',
	templateUrl: './email-address.component.html'
})

export class EmailAddressComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public newEmailAddress = '';
	public validationKey = '';
	public validationEmailSent = false;

	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		public readonly accountService: AccountService,
		private readonly apiService: ApiService,
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


	// Sends the email address validation email.
	public async sendValidationEmail(): Promise<void>
	{
		try
		{
			if(!this.newEmailAddress) throw new Error('Please enter a new email address.');

			// Send the email address validation email.
			await this.apiService.sendEmailAddressValidationEmail(
				this.accountService.getAccessData(), this.newEmailAddress);

			this.validationEmailSent = true;

			// Send a success message.
			this.messageService.message('Email validation code sent.');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Changes the email address.
	public async change(): Promise<void>
	{
		try
		{
			if(!this.validationKey) throw new Error('Please enter a validation key.');

			// Change the email address.
			await this.accountService.changeEmailAddress(
				this.newEmailAddress, this.validationKey);

			// Send a success message.
			this.messageService.message('Your email '+
				'address has been changed successfully.');

			// Return to the options page.
			this.utilityService.close('options');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
