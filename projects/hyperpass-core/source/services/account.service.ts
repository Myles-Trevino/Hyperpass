/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy} from '@angular/core';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

import {Types, Constants} from 'builds/hyperpass-common';

import {CryptoService} from './crypto.service';
import {MessageService} from './message.service';
import {ApiService} from './api.service';
import {StorageService} from './storage.service';
import {BiometricService} from './biometric.service';
import {PlatformService} from './platform.service';
import {StateService} from './state.service';
import {InitializationService} from './initialization.service';


@Injectable({providedIn: 'root'})

export class AccountService implements OnDestroy
{
	public emailAddress?: string;
	public vault?: Types.Vault;

	public readonly loginSubject = new Subject<boolean>();
	public readonly resetLoginTimeoutSubject = new Subject<number>();
	public readonly loginTimeoutSubject = new Subject<void>();
	public readonly vaultUpdateSubject = new Subject<void>();
	public loggedIn = false;
	public loggingIn = false;

	public loginTimeout: Types.LoginTimeout = Constants.defaultLoginTimeout;
	public loginTimeoutDuration = Constants.defaultLoginTimeoutDuration;
	public publicInformation?: Types.PublicAccountInformation;
	public accessKey?: Types.EncryptedKey;
	public vaultKey?: Types.Key;
	private nextAccessKey?: Types.EncryptedKey;
	private automaticLoginKey?: string;
	private loginTimeoutStart?: DOMHighResTimeStamp;
	private loginTimeoutTimeout?: NodeJS.Timeout;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly cryptoService: CryptoService,
		private readonly biometricService: BiometricService,
		private readonly messageService: MessageService,
		private readonly apiService: ApiService,
		private readonly storageService: StorageService,
		private readonly platformService: PlatformService,
		private readonly initializationService: InitializationService,
		private readonly stateService: StateService){}


	// Destructor.
	public ngOnDestroy(): void
	{
		// Clear the login timeout.
		if(this.loginTimeoutTimeout) clearTimeout(this.loginTimeoutTimeout);
	}


	// Logs in using the given email address and master password. Redirects to the
	// validation page if the account has not been validated, or the app page
	// if the account has been validated.
	public async logIn(emailAddress: string, masterPassword: string,
		getPublicInformation = true): Promise<void>
	{
		try
		{
			if(this.loggedIn) return;
			this.loggingIn = true;
			this.emailAddress = emailAddress;

			// If offline, attempt offline login.
			if(!this.stateService.isOnline)
			{
				// Load the cached vault.
				const cachedVault = await this.storageService.getData(Constants.vaultKey);
				if(!cachedVault) return;

				// Decrypt the cached vault.
				const encryptedVault = JSON.parse(cachedVault) as Types.EncryptedData;
				await this.decryptVault(encryptedVault, masterPassword, false);
			}

			// Otherwise, perform a normal login.
			else
			{
				// Get the public information if necessary.
				if(getPublicInformation) await this.getPublicInformation(emailAddress);
				if(!this.publicInformation) throw new Error('No public information.');

				// Get the access key.
				const encrypted = this.publicInformation.encryptedAccessKey;
				const key = await this.cryptoService.deriveKey(masterPassword, encrypted);
				const value = this.cryptoService.decrypt(encrypted, key);
				this.accessKey = {encrypted, value};

				// Generate the next access key
				this.nextAccessKey =
					await this.cryptoService.generateEncryptedKey(masterPassword);

				// Redirect to the validation page if the account has not been validated
				if(!this.publicInformation.validated)
				{
					this.router.navigate(['/validation']);
					this.loggingIn = false;
					return;
				}

				// Retrieve the vault.
				await this.pullVault(masterPassword);
			}

			// Set the login flag.
			this.loggedIn = true;

			// Cache the login credentials.
			await this.cacheLoginCredentials(masterPassword);

			// Trigger the login subject.
			this.loginSubject.next(this.loggedIn);

			// If this is the extension, load the state.
			if(this.platformService.isExtension)
				await this.stateService.load(masterPassword);

			// Redirect to the web app.
			this.router.navigate(['/app']);
		}

		// Handle errors.
		catch(error: unknown)
		{
			this.logOut();
			throw error;
		}

		this.loggingIn = false;
	}


	// Attempts to log in automatically.
	public async automaticLogIn(): Promise<void>
	{
		try
		{
			// Load the cached login credentials.
			const cachedEmailAddress =
				await this.storageService.getData(Constants.emailAddressKey);

			if(!cachedEmailAddress) throw new Error('No cached email address.');

			// Get the public information.
			await this.getPublicInformation(cachedEmailAddress);

			// If both the email address and master password are cached,
			// attempt to log in with the cached credentials.
			const cachedMasterPassword = await this.loadCachedMasterPassword();

			if(cachedMasterPassword)
			{
				try{ await this.logIn(cachedEmailAddress, cachedMasterPassword, false); }
				catch(error: unknown){ /* Suppress errors. */ }
				if(this.loggedIn) return; // Success.
			}

			// If logging in with cached credentials failed or was
			// not possible, attempt biometric login if it is enabled.
			try
			{
				await this.biometricLogin(cachedEmailAddress);
			}
			catch(error: unknown){ throw new Error('Could not automatically log in.'); }
		}

		// Log out and suppress errors.
		catch(error: unknown){ await this.logOut(); }
	}


	// Attempts biometric login.
	public async biometricLogin(emailAddress: string): Promise<void>
	{
		const credentials = await this.biometricService.login(emailAddress);
		await this.logIn(credentials.emailAddress, credentials.masterPassword);
	}


	// Logs out on the current device.
	public async logOut(): Promise<void>
	{
		if(this.loggedIn && this.stateService.isOnline)
			await this.apiService.logOut(this.getAccessData());

		this.reset();
	}


	// Logs out on all devices.
	public async globalLogout(): Promise<void>
	{
		if(!this.stateService.isOnline) return;
		if(!this.nextAccessKey) throw new Error('No next access key.');
		await this.apiService.globalLogout(this.getAccessData(), this.nextAccessKey);
		this.reset();
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
		if(!this.stateService.isOnline) return;
		await this.apiService.setVault(this.getAccessData(), this.getEncryptedVault());
		this.vaultUpdateSubject.next();
	}


	// Pulls the vault and (re)applies the settings.
	public async pullVault(masterPassword?: string): Promise<void>
	{
		if(!this.stateService.isOnline) return;

		// Get the encrypted vault.
		const encryptedVault = await this.apiService.getVault(this.getAccessData());

		// Decrypt the encrypted vault.
		await this.decryptVault(encryptedVault, masterPassword);
	}


	// Changes the email address.
	public async changeEmailAddress(newEmailAddress: string,
		validationKey: string): Promise<void>
	{
		if(!this.stateService.isOnline) return;

		await this.apiService.changeEmailAddress(
			this.getAccessData(), newEmailAddress, validationKey);

		// Recache the login credentials.
		this.emailAddress = newEmailAddress;
		this.cacheLoginCredentials();
	}


	// Validates the master password.
	public validateMasterPassword(masterPassword: string,
		masterPasswordConfirmation: string): void
	{
		if(!masterPassword) throw new Error('Please enter a master password.');

		if(masterPassword.length < Constants.minimumMasterPasswordLength)
			throw new Error(`Your master password must be at least ${
				Constants.minimumMasterPasswordLength} characters.`);

		if(!masterPasswordConfirmation)
			throw new Error('Please confirm your master password.');

		if(masterPassword !== masterPasswordConfirmation)
			throw new Error('The entered master passwords do not match.');
	}


	// Changes the master password.
	public async changeMasterPassword(newMasterPassword: string): Promise<void>
	{
		if(!this.stateService.isOnline) return;

		// Generate new access keys with the new master password.
		const newAccessKey =
			await this.cryptoService.generateEncryptedKey(newMasterPassword);

		const newNextAccessKey =
			await this.cryptoService.generateEncryptedKey(newMasterPassword);

		// Compress and encrypt the vault with the new master password.
		const newVaultKey = await this.cryptoService.deriveKey(newMasterPassword);

		const newEncryptedVault = this.cryptoService.compressAndEncrypt(
			JSON.stringify(this.vault), newVaultKey);

		// Send the request.
		await this.apiService.changeMasterPassword(
			this.getAccessData(), newAccessKey, newEncryptedVault);

		// Update the keys.
		this.accessKey = newAccessKey;
		this.nextAccessKey = newNextAccessKey;
		this.vaultKey = newVaultKey;

		// Recache the login credentials.
		this.cacheLoginCredentials(newMasterPassword);
	}


	// Updates the login timeout duration.
	public async updateLoginTimeoutDuration(): Promise<void>
	{
		const cachedLoginTimeout = await this.storageService.getData(
			Constants.loginTimeoutKey) as Types.LoginTimeout | undefined;

		if(cachedLoginTimeout) this.loginTimeout = cachedLoginTimeout;

		switch(this.loginTimeout)
		{
			case '5 Minutes': this.loginTimeoutDuration = 5; break;
			case '1 Hour': this.loginTimeoutDuration = 60; break;
			case '1 Day': this.loginTimeoutDuration = 60*24; break;
			case '1 Week': this.loginTimeoutDuration = 60*24*7; break;
		}
	}


	// Resets the login timeout if one is active.
	public resetLoginTimeout(force = false): void
	{
		// Return if the login timeout has not been started.
		if(!this.loginTimeoutTimeout) return;

		// Enforce a cooldown unless forced not to.
		if(!force && (this.loginTimeoutStart !== undefined) && performance.now()-
			this.loginTimeoutStart < Constants.loginTimeoutGranularity) return;

		// If online, update the automatic login key duration.
		if(this.stateService.isOnline) this.apiService.setAutomaticLoginKey(
			this.getAccessData(), undefined, this.loginTimeoutDuration);

		// Reset the login timeout.
		this.startLoginTimeout();
	}


	// Starts the login timeout.
	private startLoginTimeout(): void
	{
		// Update the subject.
		this.resetLoginTimeoutSubject.next(this.loginTimeoutDuration);

		// Stop the timeout if it has been started.
		if(this.loginTimeoutTimeout)
		{
			clearTimeout(this.loginTimeoutTimeout);
			this.loginTimeoutTimeout = undefined;
		}

		// Start the timeout.
		this.loginTimeoutStart = performance.now();

		this.loginTimeoutTimeout = setTimeout(() =>
		{
			this.loginTimeoutSubject.next();
			this.logOut();
			this.messageService.message('You have been '+
				'automatically logged out due to inactivity.', 0);
		}, this.loginTimeoutDuration*60*1000);
	}


	// Resets the account service and the state.
	private reset(): void
	{
		// Clear the login timeout.
		if(this.loginTimeoutTimeout)
		{
			clearTimeout(this.loginTimeoutTimeout);
			this.loginTimeoutTimeout = undefined;
		}

		// Reset the variables.
		this.emailAddress = undefined;
		this.vault = undefined;

		this.loggingIn = false;

		this.loginTimeout = Constants.defaultLoginTimeout;
		this.loginTimeoutDuration = Constants.defaultLoginTimeoutDuration;
		this.publicInformation = undefined;
		this.accessKey = undefined;
		this.vaultKey = undefined;
		this.nextAccessKey = undefined;
		this.automaticLoginKey = undefined;
		this.loginTimeoutStart = undefined;
		this.loginTimeoutTimeout = undefined;

		// Log out and reinitialize if logged in.
		if(this.loggedIn)
		{
			this.loggedIn = false;
			this.loginSubject.next(this.loggedIn);
			this.initializationService.reinitialize();
		}
	}


	// Gets the public information.
	private async getPublicInformation(emailAddress: string): Promise<void>
	{
		this.publicInformation = await this.apiService.getPublicInformation(emailAddress);
		this.automaticLoginKey = this.publicInformation.automaticLoginKey;
	}


	// Caches the email address and master password in local browser storage.
	private async cacheLoginCredentials(masterPassword?: string): Promise<void>
	{
		if(!this.emailAddress) throw new Error('No email address was provided.');

		// Cache the email address.
		await this.storageService.setData(Constants.emailAddressKey, this.emailAddress);

		// Return if offline.
		if(!this.stateService.isOnline) return;

		// If the master password was not provided, try to load it.
		masterPassword ??= await this.loadCachedMasterPassword();
		if(!masterPassword) throw new Error('No master password was provided.');

		// Create a new automatic login key if the previous one expired.
		if(!this.automaticLoginKey)
		{
			this.automaticLoginKey = this.cryptoService.randomBytes(Constants.keyLength);
			await this.apiService.setAutomaticLoginKey(this.getAccessData(),
				this.automaticLoginKey, this.loginTimeoutDuration);
		}

		// Generate the automatic login cipher.
		const cipher = this.cryptoService.encrypt(masterPassword,
			{key: this.cryptoService.toBytes(this.automaticLoginKey)});

		// Store the cipher.
		await this.storageService.setData(
			Constants.masterPasswordKey, JSON.stringify(cipher));
	}


	// Loads the master password (and email address) from local browser storage.
	private async loadCachedMasterPassword(): Promise<string | undefined>
	{
		try
		{
			// Get the automatic login cipher.
			const cipher = await this.storageService.getData(Constants.masterPasswordKey);
			if(!cipher) return undefined;

			// Decrypt the automatic login cipher.
			if(!this.automaticLoginKey) return undefined;

			return this.cryptoService.decrypt(JSON.parse(cipher) as Types.EncryptedData,
				{key: this.cryptoService.toBytes(this.automaticLoginKey)});
		}

		// Return undefined on error.
		catch(error: unknown){ return undefined; }
	}


	// Decrypts the given encrypted vault.
	private async decryptVault(encryptedVault: Types.EncryptedData,
		masterPassword?: string, cache = true): Promise<void>
	{
		// Cache the encrypted vault unless specified.
		if(cache) this.storageService.setData(
			Constants.vaultKey, JSON.stringify(encryptedVault));

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
		await this.updateLoginTimeoutDuration();

		// Start the login timeout.
		this.startLoginTimeout();
	}
}
