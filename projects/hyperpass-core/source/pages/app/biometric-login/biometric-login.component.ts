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
import {CryptoService} from '../../../services/crypto.service';
import {BiometricService} from '../../../services/biometric.service';


@Component
({
	selector: 'hyperpass-biometric-login',
	templateUrl: './biometric-login.component.html'
})

export class BiometricLoginComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public isEnabled = false;
	public masterPassword = '';
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly biometricService: BiometricService,
		private readonly cryptoService: CryptoService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly ionicPlatform: Ionic.Platform){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(100, () => { this.utilityService.close('options'); });

		// Check if biometric login has been enabled.
		await this.updateIsEnabled();
	}


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Enables biometric login.
	public async enable(): Promise<void>
	{
		try
		{
			// Make sure the master password is valid.
			if(this.masterPassword === '')
				throw new Error('Please enter your master password.');

			const accessKey = this.accountService.accessKey;
			if(!accessKey) throw new Error('No access key.');

			const key = await this.cryptoService.deriveKey(
				this.masterPassword, accessKey.encrypted);

			this.cryptoService.decrypt(accessKey.encrypted, key);

			// Enable biometric login.
			if(!this.accountService.emailAddress) throw new Error('No email address.');

			await this.biometricService.enable(
				this.accountService.emailAddress, this.masterPassword);

			await this.updateIsEnabled();
			this.messageService.message('Enabled.');
			this.masterPassword = '';
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Disables biometric login.
	public async disable(): Promise<void>
	{
		try
		{
			await this.biometricService.disable();
			await this.updateIsEnabled();
			this.messageService.message('Disabled.');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Updates whether biometric login is enabled.
	public async updateIsEnabled(): Promise<void>
	{
		if(!this.accountService.emailAddress) throw new Error('No email address.');

		this.isEnabled =
			await this.biometricService.isEnabled(this.accountService.emailAddress);
	}
}
