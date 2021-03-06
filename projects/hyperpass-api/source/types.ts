/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type MongoDB from 'mongodb';


export class ApiError extends Error
{
	public statusCode: number;

	public constructor(message: string, statusCode = 400)
	{
		super(message);
		this.statusCode = statusCode;
	}
}


export type EncryptedData =
{
	ciphertext: string;
	nonce: string;
	salt: string;
};

export type EncryptedKey =
{
	value: string;
	encrypted: EncryptedData;
};

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
	_id: MongoDB.ObjectID;
	version: number;
	emailAddress: string;
	validationKey?: string;
	accessKey: EncryptedKey;
	automaticLoginKeys: Record<string, AutomaticLoginKey>;
	encryptedVault: EncryptedData;
	emailAddressValidationKey?: EmailAddressValidationKey;
};


export type AccessData =
{
	emailAddress: string;
	accessKey: string;
};


// Requests.
export type UnsecuredRequest = {emailAddress: string};

export type SecuredRequest = {accessData: AccessData};

export type GetPublicDataRequest = UnsecuredRequest & {deviceId: string};

export type CreateAccountRequest = UnsecuredRequest &
{
	version: number;
	validationKey: string;
	accessKey: EncryptedKey;
	encryptedVault: EncryptedData;
};

export type ValidateAccountRequest = SecuredRequest & {validationKey: string};

export type SetVaultRequest = SecuredRequest & {encryptedVault: EncryptedData};

export type SetAutomaticLoginKeyRequest = SecuredRequest &
{
	deviceId: string;
	key?: string;
	duration: number;
};

export type UpdateAutomaticLoginKeyRequest = SecuredRequest & {duration?: number};

export type ChangeMasterPasswordRequest = SecuredRequest &
{
	newAccessKey: EncryptedKey;
	newEncryptedVault: EncryptedData;
};

export type SendEmailAddressValidationEmailRequest = SecuredRequest & {emailAddress: string};

export type ChangeEmailAddressRequest = SecuredRequest & EmailAddressValidationKey;

export type LogoutRequest = SecuredRequest & {deviceId: string};

export type GlobalLogoutRequest = SecuredRequest & {newAccessKey: EncryptedKey};
