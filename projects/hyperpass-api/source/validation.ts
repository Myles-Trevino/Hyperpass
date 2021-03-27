/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import Joi from 'joi';

import * as Types from './types';


// General schemas.
export const keySchema = Joi.string().base64();

export const emailAddressSchema = Joi.string().email();

export const encryptedDataSchema = Joi.object
({
	ciphertext: Joi.string().base64().required(),
	nonce: Joi.string().base64().required(),
	salt: Joi.string().base64().required()
});

export const encryptedKeySchema = Joi.object
({
	value: Joi.string().base64(),
	encrypted: encryptedDataSchema.required()
});

export const accessDataSchema = Joi.object
({
	emailAddress: emailAddressSchema.required(),
	accessKey: keySchema.required()
});


// Request schemas.
export const unsecuredRequestSchema =
	Joi.object({emailAddress: emailAddressSchema.required()});

export const securedRequestSchema =
	Joi.object({accessData: accessDataSchema.required()});

export const createAccountRequestSchema = Joi.object
({
	version: Joi.number().integer().required(),
	emailAddress: emailAddressSchema.required(),
	accessKey: encryptedKeySchema.required(),
	encryptedVault: encryptedDataSchema.required()
});

export const validateAccountRequestSchema = securedRequestSchema.concat(
	Joi.object({validationKey: keySchema.required()}));

export const setVaultRequestSchema = securedRequestSchema.concat(
	Joi.object({encryptedVault: encryptedDataSchema.required()}));

export const setAutomaticLoginKeyRequestSchema = securedRequestSchema.concat(Joi.object
({
	key: keySchema,
	duration: Joi.number()
}));

export const updateAutomaticLoginKeyRequestSchema =
	securedRequestSchema.concat(Joi.object({duration: Joi.number()}));

export const changeMasterPasswordRequestSchema = securedRequestSchema.concat(Joi.object
({
	newAccessKey: encryptedKeySchema.required(),
	newEncryptedVault: encryptedDataSchema.required()
}));

export const logOutRequestSchema = securedRequestSchema.concat(
	Joi.object({newAccessKey: encryptedKeySchema.required()}));


// Validates the given value with the given schema.
export function validate(value: unknown, schema: Joi.Schema): unknown
{
	const result = schema.validate(value);
	if(result.error) throw new Types.ApiError(`Invalid request: ${result.error.message}.`);
	return result.value;
}
