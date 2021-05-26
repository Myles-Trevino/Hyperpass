/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import type * as Types from '../types';
import * as Settings from '../settings';
import {PlatformService} from './platform.service';


@Injectable({providedIn: 'root'})

export class ApiService
{
	// Constructor.
	public constructor(private readonly httpClient: HttpClient,
		private readonly platformService: PlatformService){}


	// /get-minimum-version.
	public getMinimumVersion(): Promise<string>
	{
		return this.httpClient.get(`${Settings.apiUrl}/get-minimum-version`,
			{responseType: 'text'}).toPromise();
	}


	// /create-account.
	public async createAccount(version: number, emailAddress: string,
		accessKey: Types.EncryptedKey, encryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/create-account`,
			{version, emailAddress, accessKey, encryptedVault}).toPromise();
	}


	// /get-public-information.
	public getPublicInformation(
		emailAddress: string): Promise<Types.PublicAccountInformation>
	{
		return this.httpClient.post<Types.PublicAccountInformation>(
			`${Settings.apiUrl}/get-public-information`,
			{emailAddress, deviceId: this.platformService.deviceId}).toPromise();
	}


	// /send-account-validation-email.
	public async sendAccountValidationEmail(accessData: Types.AccessData): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/send-`+
			`account-validation-email`, {accessData}).toPromise();
	}


	// /validate-account.
	public async validateAccount(accessData: Types.AccessData,
		validationKey: string): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/validate-account`,
			{accessData, validationKey}).toPromise();
	}


	// /get-vault.
	public getVault(accessData: Types.AccessData): Promise<Types.EncryptedData>
	{
		return this.httpClient.post<Types.EncryptedData>(
			`${Settings.apiUrl}/get-vault`, {accessData}).toPromise();
	}


	// /set-vault.
	public async setVault(accessData: Types.AccessData,
		encryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/set-vault`,
			{accessData, encryptedVault}).toPromise();
	}


	// /set-automatic-login-key.
	public async setAutomaticLoginKey(accessData: Types.AccessData,
		key: string | undefined, duration: number): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/`+
			`set-automatic-login-key`, {deviceId: this.platformService.deviceId,
			accessData, key, duration}).toPromise();
	}


	// /change-master-password.
	public async changeMasterPassword(accessData: Types.AccessData,
		newAccessKey: Types.EncryptedKey,
		newEncryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/change-master-password`,
			{accessData, newAccessKey, newEncryptedVault}).toPromise();
	}


	// /send-email-address-validation-email.
	public async sendEmailAddressValidationEmail(
		accessData: Types.AccessData, emailAddress: string): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/send-email-address-validation-email`,
			{accessData, emailAddress}).toPromise();
	}


	// /change-email-address.
	public async changeEmailAddress(accessData: Types.AccessData,
		emailAddress: string, validationKey: string): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/change-email-address`,
			{accessData, emailAddress, validationKey}).toPromise();
	}


	// /log-out.
	public async logOut(accessData: Types.AccessData): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/log-out`, {accessData,
			deviceId: this.platformService.deviceId}).toPromise();
	}


	// /global-logout.
	public async globalLogout(accessData: Types.AccessData,
		newAccessKey: Types.EncryptedKey): Promise<void>
	{
		await this.httpClient.post(`${Settings.apiUrl}/global-logout`,
			{accessData, newAccessKey}).toPromise();
	}


	// Get words.
	public async getWords(): Promise<string[]>
	{
		const response = await this.httpClient.get(`${Settings.staticUrl}`+
			`/data/words.txt`, {responseType: 'text'}).toPromise();

		if(!response) throw new Error('Could not load the words.');
		return response.split('\n');
	}
}
