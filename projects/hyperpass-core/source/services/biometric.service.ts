/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import * as Capacitor from '@capacitor/core';
import type {NativeBiometricPlugin} from 'capacitor-native-biometric';

import type * as Types from '../types';
import * as Settings from '../settings';


const {NativeBiometric} = Capacitor.Plugins;


@Injectable({providedIn: 'root'})

export class BiometricService
{
	// Enables biometric login.
	public async enable(emailAddress: string, masterPassword: string): Promise<void>
	{
		// Make sure biometrics are available on the device.
		await this.ensureAvailability();

		// Store the credentials.
		await NativeBiometric.setCredentials
		({
			username: emailAddress,
			password: masterPassword,
			server: Settings.apiUrl
		});
	}


	// Disables biometric login.
	public async disable(): Promise<void>
	{
		await NativeBiometric.deleteCredentials({server: Settings.apiUrl});
	}


	// Attempts biometric login.
	public async login(emailAddress: string): Promise<Types.LoginCredentials>
	{
		// Make sure biometrics are available on the device.
		await this.ensureAvailability();

		// Get the credentials.
		const credentials = this.getCredentials(emailAddress);

		// Vertify the user's identity.
		await NativeBiometric.verifyIdentity();
		return credentials;
	}


	// Check if biometric login has been enabled.
	public async isEnabled(emailAddress: string): Promise<boolean>
	{
		try{ await this.getCredentials(emailAddress); }
		catch(error: unknown){ return false; }
		return true;
	}


	// Makes sure biometrics are available on the device.
	private async ensureAvailability(): Promise<void>
	{
		if(!(await NativeBiometric.isAvailable()).isAvailable)
			throw new Error('Biometric login has not been '+
				'set up or is not available on your device.');
	}


	// Get the stored credentials.
	private async getCredentials(emailAddress: string): Promise<Types.LoginCredentials>
	{
		const credentials = await NativeBiometric.getCredentials({server: Settings.apiUrl});

		if(emailAddress !== credentials.username)
			throw new Error('The saved credentials do not match the given email address.');

		return {emailAddress: credentials.username, masterPassword: credentials.password};
	}
}
