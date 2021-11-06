/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import * as _ from 'lodash';

import {Types, Constants} from 'builds/hyperpass-common';

import * as Animations from '../../animations';
import {CryptoService} from '../../services/crypto.service';
import {AccountService} from '../../services/account.service';
import {MessageService} from '../../services/message.service';
import {ApiService} from '../../services/api.service';
import {StorageService} from '../../services/storage.service';
import {MetadataService} from '../../services/metadata.service';
import {PlatformService} from '../../services/platform.service';


@Component
({
	selector: 'hyperpass-signup',
	templateUrl: './signup.component.html',
	animations: [Animations.fadeInAnimation]
})

export class SignupComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'centerer-page';

	public emailAddress = '';
	public masterPassword = '';
	public confirmMasterPassword = '';


	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		private readonly apiService: ApiService,
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly cryptoService: CryptoService,
		private readonly storageService: StorageService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Signup');
		this.metadataService.setDescription('Create an account to start using Hyperpass.');
		this.metadataService.setImage('signup');
	}


	// Adds a new user account and redirects to the account validation page.
	public async signUp(): Promise<void>
	{
		try
		{
			// Validate the email address.
			if(!this.emailAddress) throw new Error('Please enter your email address.');

			if(!/^.+@.+\..+$/.test(this.emailAddress))
				throw new Error('Invalid email address.');

			// Cache the email address.
			await this.storageService.setData(Constants.emailAddressKey, this.emailAddress);

			// Validate the master password.
			this.accountService.validateMasterPassword(
				this.masterPassword, this.confirmMasterPassword);

			// Generate the access key.
			const accessKey =
				await this.cryptoService.generateEncryptedKey(this.masterPassword);

			// Generate the initial vault, and compress and encrypt it.
			const vault: Types.Vault = _.clone(Types.defaultVault);

			const encryptedVault =
				this.cryptoService.compressAndEncrypt(JSON.stringify(vault),
					await this.cryptoService.deriveKey(this.masterPassword));

			// Send the account creation request.
			await this.apiService.createAccount(1,
				this.emailAddress, accessKey, encryptedVault);

			// Log in and redirect to the validation page
			// (or the login page if account validation is disabled).
			await this.accountService.logIn(this.emailAddress, this.masterPassword);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
