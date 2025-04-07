/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as Ionic from '@ionic/angular';
import {NgScrollbar} from 'ngx-scrollbar';

import {UtilityService} from '../../../services/utility.service';
import {CryptoService} from '../../../services/crypto.service';
import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {ApiService} from '../../../services/api.service';
import {MasterPasswordInputComponent} from '../../../master-password-input/master-password-input.component';


@Component
({
	selector: 'hyperpass-delete-account',
	templateUrl: './delete-account.component.html',
	imports: [NgScrollbar, MasterPasswordInputComponent]
})

export class DeleteAccountComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public masterPassword = '';
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		private readonly cryptoService: CryptoService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly apiService: ApiService,
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


	// Enables biometric login.
	public async delete(): Promise<void>
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

			// Delete the account and globally log out.
			this.apiService.deleteAccount(this.accountService.getAccessData());
			this.accountService.globalLogout();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
