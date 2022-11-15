/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as Rxjs from 'rxjs';

import {Types, Constants} from 'builds/hyperpass-common';

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
		return this.wrapper(this.httpClient.get(
			`${this.platformService.apiServer}/get-minimum-version`,
			{responseType: 'text'}));
	}


	// /create-account.
	public async createAccount(version: number, emailAddress: string,
		accessKey: Types.EncryptedKey, encryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/create-account`,
			{version, emailAddress, accessKey, encryptedVault}));
	}


	// /get-public-information.
	public getPublicInformation(
		emailAddress: string): Promise<Types.PublicAccountInformation>
	{
		return this.wrapper(this.httpClient.post<Types.PublicAccountInformation>(
			`${this.platformService.apiServer}/get-public-information`,
			{emailAddress, deviceId: this.platformService.deviceId}));
	}


	// /send-account-validation-email.
	public async sendAccountValidationEmail(accessData: Types.AccessData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/send-account-validation-email`,
			{accessData}));
	}


	// /validate-account.
	public async validateAccount(accessData: Types.AccessData,
		validationKey: string): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/validate-account`,
			{accessData, validationKey}));
	}


	// /get-vault.
	public getVault(accessData: Types.AccessData): Promise<Types.EncryptedData>
	{
		return this.wrapper(this.httpClient.post<Types.EncryptedData>(
			`${this.platformService.apiServer}/get-vault`, {accessData}));
	}


	// /set-vault.
	public async setVault(accessData: Types.AccessData,
		encryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/set-vault`, {accessData, encryptedVault}));
	}


	// /set-automatic-login-key.
	public async setAutomaticLoginKey(accessData: Types.AccessData,
		key: string | undefined, duration: number): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/set-automatic-login-key`,
			{deviceId: this.platformService.deviceId, accessData, key, duration}));
	}


	// /change-master-password.
	public async changeMasterPassword(accessData: Types.AccessData,
		newAccessKey: Types.EncryptedKey,
		newEncryptedVault: Types.EncryptedData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/change-master-password`,
			{accessData, newAccessKey, newEncryptedVault}));
	}


	// /send-email-address-validation-email.
	public async sendEmailAddressValidationEmail(
		accessData: Types.AccessData, emailAddress: string): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/send-email-address-validation-email`,
			{accessData, emailAddress}));
	}


	// /change-email-address.
	public async changeEmailAddress(accessData: Types.AccessData,
		emailAddress: string, validationKey: string): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/change-email-address`,
			{accessData, emailAddress, validationKey}));
	}


	// /log-out.
	public async logOut(accessData: Types.AccessData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/log-out`,
			{accessData, deviceId: this.platformService.deviceId}));
	}


	// /global-logout.
	public async globalLogout(accessData: Types.AccessData,
		newAccessKey: Types.EncryptedKey): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/global-logout`,
			{accessData, newAccessKey}));
	}


	// /delete-account.
	public async deleteAccount(accessData: Types.AccessData): Promise<void>
	{
		await this.wrapper(this.httpClient.post(
			`${this.platformService.apiServer}/delete-account`, {accessData}));
	}


	// Wrapper for all API calls.
	private wrapper<T>(child: Rxjs.Observable<T>): Promise<T>
	{
		return Rxjs.firstValueFrom(child.pipe(Rxjs.timeout(Constants.requestTimeout)));
	}
}
