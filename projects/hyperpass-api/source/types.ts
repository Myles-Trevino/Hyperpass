/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import * as MongoDB from 'mongodb';

import {Types as CommonTypes} from 'builds/hyperpass-common';


export class ApiError extends Error
{
	public statusCode: number;

	public constructor(message: string, statusCode = 400)
	{
		super(message);
		this.statusCode = statusCode;
	}
}

export type AutomaticLoginKey =
{
	key: string;
	duration: number;
	date: Date;
};

export type EmailAddressValidationKey =
{
	emailAddress: string;
	validationKey: string;
};


export type Account =
{
	_id: MongoDB.ObjectId;
	version: number;
	emailAddress: string;
	validationKey?: string;
	accessKey: CommonTypes.EncryptedKey;
	automaticLoginKeys: Record<string, AutomaticLoginKey>;
	encryptedVault: CommonTypes.EncryptedData;
	emailAddressValidationKey?: EmailAddressValidationKey;
};


// Requests.
export type UnsecuredRequest = {emailAddress: string};

export type SecuredRequest = {accessData: CommonTypes.AccessData};

export type GetPublicDataRequest = UnsecuredRequest & {deviceId: string};

export type CreateAccountRequest = UnsecuredRequest &
{
	version: number;
	validationKey: string;
	accessKey: CommonTypes.EncryptedKey;
	encryptedVault: CommonTypes.EncryptedData;
};

export type ValidateAccountRequest = SecuredRequest & {validationKey: string};

export type SetVaultRequest = SecuredRequest &
{encryptedVault: CommonTypes.EncryptedData};

export type SetAutomaticLoginKeyRequest = SecuredRequest &
{
	deviceId: string;
	key?: string;
	duration: number;
};

export type UpdateAutomaticLoginKeyRequest = SecuredRequest & {duration?: number};

export type ChangeMasterPasswordRequest = SecuredRequest &
{
	newAccessKey: CommonTypes.EncryptedKey;
	newEncryptedVault: CommonTypes.EncryptedData;
};

export type SendEmailAddressValidationEmailRequest = SecuredRequest & {emailAddress: string};

export type ChangeEmailAddressRequest = SecuredRequest & EmailAddressValidationKey;

export type LogoutRequest = SecuredRequest & {deviceId: string};

export type GlobalLogoutRequest = SecuredRequest &
{newAccessKey: CommonTypes.EncryptedKey};
