/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

import type * as Types from '../types';
import * as Settings from '../settings';
import {CryptoService} from './crypto.service';
import {MessageService} from './message.service';
import {ApiService} from './api.service';
import {ThemeService} from './theme.service';
import {StorageService} from './storage.service';


@Injectable({providedIn: 'root'})

export class AccountService implements OnDestroy
{
	public emailAddress?: string;
	public vault?: Types.Vault;

	public readonly loginSubject = new Subject<boolean>();
	public readonly resetLoginTimeoutSubject = new Subject<number>();
	public readonly loginTimeoutSubject = new Subject<void>();
	public readonly vaultUpdateSubject = new Subject<void>();
	public navigate = true;

	public loggedIn = false;
	public loggingIn = false;
	public loginTimeoutDuration?: number;
	private accessKey?: Types.EncryptedKey;
	private nextAccessKey?: Types.EncryptedKey;
	private automaticLoginKey?: string;
	private vaultKey?: Types.Key;
	private loginTimeoutStart?: DOMHighResTimeStamp;
	private loginTimeout?: NodeJS.Timeout;

	// Constructor.
	public constructor(private readonly router: Router,
		private readonly cryptoService: CryptoService,
		private readonly messageService: MessageService,
		private readonly apiService: ApiService,
		private readonly themeService: ThemeService,
		private readonly storageService: StorageService){}


	// Destructor.
	public ngOnDestroy(): void
	{
		// Clear the login timeout.
		if(this.loginTimeout) clearTimeout(this.loginTimeout);
	}


	// Logs in using the given email address and master password. Redirects to the
	// validation page if the account has not been validated, or the app page
	// if the account has been validated.
	public async logIn(emailAddress?: string, masterPassword?: string): Promise<void>
	{
		try
		{
			if(this.loggedIn) return;
			this.loggingIn = true;

			// Make sure the email address is provided or cached.
			if(!emailAddress)
			{
				if(!this.emailAddress) this.emailAddress =
					await this.storageService.getData(Settings.emailAddressKey);

				if(!this.emailAddress) throw new Error('No email address was provided.');

				emailAddress = this.emailAddress;
			}
			else this.emailAddress = emailAddress;

			// Get the public information.
			const publicInformation =
			await this.apiService.getPublicInformation(emailAddress);

			// Cache the automatic login key.
			this.automaticLoginKey = publicInformation.automaticLoginKey;

			// Make sure the master password is provided or cached.
			if(!masterPassword) masterPassword = await this.loadCachedMasterPassword();
			if(!masterPassword) throw new Error('No master password was provided.');

			// Get the access key.
			const encrypted = publicInformation.encryptedAccessKey;
			const key = await this.cryptoService.deriveKey(masterPassword, encrypted);
			const value = this.cryptoService.decrypt(encrypted, key);
			this.accessKey = {encrypted, value};

			// Generate the next access key
			this.nextAccessKey =
				await this.cryptoService.generateEncryptedKey(masterPassword);

			// Redirect to the validation page if the account has not been validated
			if(!publicInformation.validated)
			{
				this.loggingIn = false;
				if(this.navigate) this.router.navigate(['/validation']);
				return;
			}

			// Retrieve the vault.
			await this.pullVault(masterPassword);

			// Redirect to the web app.
			if(this.navigate) this.router.navigate(['/app']);
			this.loggedIn = true;
			this.loginSubject.next(this.loggedIn);
		}

		// Handle errors.
		catch(error: unknown)
		{
			this.logOut();
			throw error;
		}

		this.loggingIn = false;
	}


	// Silently attempts a login using the cached credentials.
	public async automaticLogIn(): Promise<void>
	{
		try{ await this.logIn(); }
		catch(error: unknown){}
	}


	// Logs out, clears any stored account data, and redirects to the login page.
	public async logOut(): Promise<void>
	{
		// Send the log out request.
		if(this.loggedIn && this.nextAccessKey)
			await this.apiService.logOut(this.getAccessData(), this.nextAccessKey);

		// Clear the loaded data.
		if(this.emailAddress) this.emailAddress = undefined;
		if(this.accessKey) this.accessKey = undefined;
		if(this.nextAccessKey) this.nextAccessKey = undefined;
		if(this.automaticLoginKey) this.automaticLoginKey = undefined;
		if(this.vaultKey) this.vaultKey = undefined;
		if(this.vault) this.vault = undefined;
		if(this.loginTimeoutStart !== undefined) this.loginTimeoutStart = undefined;

		if(this.loginTimeout)
		{
			clearTimeout(this.loginTimeout);
			this.loginTimeout = undefined;
		}

		this.loggingIn = false;

		if(this.loggedIn)
		{
			this.loggedIn = false;
			this.loginSubject.next(this.loggedIn);
			if(this.navigate) this.router.navigate(['/login']);
		}
	}


	// Resets the login timeout if one is active.
	public resetLoginTimeout(force = false): void
	{
		// Return if the login timeout has not been started.
		if(!this.loginTimeout) return;

		// Enforce a cooldown unless forced.
		if(!force && (this.loginTimeoutStart !== undefined) && performance.now()-
			this.loginTimeoutStart < Settings.loginTimeoutGranularity) return;

		// Update the subject.
		this.resetLoginTimeoutSubject.next(this.loginTimeoutDuration);

		// Update the automatic login key duration.
		this.apiService.setAutomaticLoginKey(this.getAccessData(),
			undefined, this.loginTimeoutDuration);

		// Reset the login timeout.
		this.startLoginTimeout();
	}


	// Returns the vault.
	public getVault(): Types.Vault
	{
		if(!this.vault) throw new Error('The vault does not exist.');
		return this.vault;
	}


	// Gets the compressed and encrypted vault.
	public getEncryptedVault(): Types.EncryptedData
	{
		if(!this.vaultKey) throw new Error('No vault key.');

		return this.cryptoService.compressAndEncrypt(
			JSON.stringify(this.vault), this.vaultKey);
	}


	// Gets the access data.
	public getAccessData(): Types.AccessData
	{
		if(!this.emailAddress || !this.accessKey)
			throw new Error('Failed to retrieve the access data.');

		return {emailAddress: this.emailAddress, accessKey: this.accessKey.value};
	}


	// Pushes the vault.
	public async pushVault(): Promise<void>
	{
		try
		{
			await this.apiService.setVault(this.getAccessData(), this.getEncryptedVault());
			this.vaultUpdateSubject.next();
		}

		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Pulls the vault and (re)applies the settings.
	public async pullVault(masterPassword?: string): Promise<void>
	{
		// Get the encrypted vault.
		const encryptedVault = await this.apiService.getVault(this.getAccessData());

		// Get the vault key if necessary.
		if(!this.vaultKey)
		{
			if(!masterPassword) throw new Error('No master password.');

			this.vaultKey = await this.cryptoService.deriveKey(
				masterPassword, encryptedVault);
		}

		// Decrypt and decompress the vault.
		this.vault = JSON.parse(this.cryptoService.decryptAndDecompress(
			encryptedVault, this.vaultKey)) as Types.Vault;

		// Apply the settings.
		await this.themeService.setTheme(this.getVault().settings.theme);
		this.updateLoginTimeoutDuration();

		// Cache the login credentials.
		this.cacheLoginCredentials(masterPassword);

		// Start the login timeout.
		this.startLoginTimeout();
	}


	// Validates the master password.
	public validateMasterPassword(masterPassword: string,
		masterPasswordConfirmation: string): void
	{
		if(!masterPassword) throw new Error('Please enter a master password.');

		if(masterPassword.length < Settings.minimumMasterPasswordLength)
			throw new Error('Your master password must be at least 16 characters.');

		if(!masterPasswordConfirmation)
			throw new Error('Please confirm your master password.');

		if(masterPassword !== masterPasswordConfirmation)
			throw new Error('The entered passwords do not match.');
	}


	// Changes the master password.
	public async changeMasterPassword(masterPassword: string): Promise<void>
	{
		// Generate new access keys with the new master password.
		const newAccessKey = await this.cryptoService.generateEncryptedKey(masterPassword);

		const newNextAccessKey =
			await this.cryptoService.generateEncryptedKey(masterPassword);

		// Compress and encrypt the vault with the new master password.
		const newVaultKey = await this.cryptoService.deriveKey(masterPassword);

		const newEncryptedVault = this.cryptoService.compressAndEncrypt(
			JSON.stringify(this.vault), newVaultKey);

		// Send the request.
		await this.apiService.changeMasterPassword(
			this.getAccessData(), newAccessKey, newEncryptedVault);

		// Update the keys.
		this.accessKey = newAccessKey;
		this.nextAccessKey = newNextAccessKey;
		this.vaultKey = newVaultKey;
	}


	// Updates the login timeout duration.
	public updateLoginTimeoutDuration(): void
	{
		const settings = this.vault?.settings;
		if(!settings) throw new Error('Failed to load the settings.');

		if(settings.loginTimeout === '5 Minutes') this.loginTimeoutDuration = 5;
		else if(settings.loginTimeout === '15 Minutes') this.loginTimeoutDuration = 15;
		else if(settings.loginTimeout === '30 Minutes') this.loginTimeoutDuration = 30;
		else this.loginTimeoutDuration = undefined;
	}


	// Starts the login timeout.
	public startLoginTimeout(): void
	{
		// Stop the timeout if it has been started.
		if(this.loginTimeout) clearTimeout(this.loginTimeout);
		this.loginTimeout = undefined;

		// If there is no login timeout, return.
		if(this.loginTimeoutDuration === undefined) return;

		// Start the timeout.
		this.loginTimeoutStart = performance.now();

		this.loginTimeout = setTimeout(() =>
		{
			this.loginTimeoutSubject.next();
			this.logOut();
			this.messageService.message('You have been '+
				'automatically logged out due to inactivity.', 0);
		}, this.loginTimeoutDuration*60*1000);
	}


	// Caches the email address and master password in local browser storage.
	private async cacheLoginCredentials(masterPassword?: string): Promise<void>
	{
		if(!this.emailAddress) throw new Error('No email address was provided.');

		// Cache the email address.
		await this.storageService.setData(Settings.emailAddressKey, this.emailAddress);

		// If the master password was not provided, try to load it.
		if(!masterPassword) masterPassword = await this.loadCachedMasterPassword();
		if(!masterPassword) throw new Error('No master password was provided.');

		// Create a new automatic login key if the previous one expired.
		if(!this.automaticLoginKey)
		{
			this.automaticLoginKey = this.cryptoService.randomBytes(Settings.keyLength);
			await this.apiService.setAutomaticLoginKey(this.getAccessData(),
				this.automaticLoginKey, this.loginTimeoutDuration);
		}

		// Generate the automatic login cipher.
		const cipher = this.cryptoService.encrypt(masterPassword,
			{key: this.cryptoService.toBytes(this.automaticLoginKey)});

		// Store the cipher.
		await this.storageService.setData(
			Settings.masterPasswordKey, JSON.stringify(cipher));
	}


	// Loads the master password (and email address) from local browser storage.
	private async loadCachedMasterPassword(): Promise<string | undefined>
	{
		try
		{
			// Get the automatic login cipher.
			const cipher = await this.storageService.getData(Settings.masterPasswordKey);
			if(!cipher) return undefined;

			// Decrypt the automatic login cipher.
			if(!this.automaticLoginKey) return undefined;

			return this.cryptoService.decrypt(JSON.parse(cipher),
				{key: this.cryptoService.toBytes(this.automaticLoginKey)});
		}

		// Handle errors.
		catch(error: unknown){ return undefined; }
	}
}
