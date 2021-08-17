/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';

import * as Animations from '../../animations';
import {AccountService} from '../../services/account.service';
import {MessageService} from '../../services/message.service';
import {ApiService} from '../../services/api.service';
import {MetadataService} from '../../services/metadata.service';
import {PlatformService} from '../../services/platform.service';


@Component
({
	selector: 'hyperpass-validation',
	templateUrl: './validation.component.html',
	animations: [Animations.fadeInAnimation]
})

export class ValidationComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'centerer-page';

	public success = false;


	public constructor(private readonly router: Router,
		private readonly apiService: ApiService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly metadataService: MetadataService,
		private readonly platformService: PlatformService){}


	public async ngOnInit(): Promise<void>
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Validation');
		this.metadataService.setDescription(
			'Validate your account to start using Hyperpass.');
		this.metadataService.setImage('validation');

		if(this.platformService.isServer) return;

		try
		{
			// Redirect to the login page if an access key has not been obtained.
			if(!this.accountService.accessKey)
			{
				this.router.navigate(['/login']);
				return;
			}

			// Send the account validation email.
			await this.sendEmail();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Sends an account validation email.
	public async sendEmail(): Promise<void>
	{
		try
		{
			if(!this.accountService.emailAddress)
				throw new Error('No email address was provided.');

			await this.apiService.sendAccountValidationEmail(
				this.accountService.getAccessData());

			this.messageService.message(`An account validation email has been `+
				`sent to ${this.accountService.emailAddress}.`);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Validates the account with the given key.
	public async validate(accountValidationKey: string): Promise<void>
	{
		try
		{
			// Check that a key was entered.
			if(!accountValidationKey)
				throw new Error('Please enter your account validation key.');

			// Send the account validation request.
			await this.apiService.validateAccount(
				this.accountService.getAccessData(), accountValidationKey.trim());

			// If the response was successful, log in and switch to the success tile.
			this.success = true;
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(new Error('Invalid key.')); }
	}
}
