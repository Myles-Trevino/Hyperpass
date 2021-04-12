/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import Express from 'express';
import Dotenv from 'dotenv';
import Crypto from 'crypto';
import MongoDB from 'mongodb';
import CORS from 'cors';

import * as Types from './types';
import * as Helpers from './helpers';
import * as Response from './response';
import * as Validation from './validation';
import * as Database from './database';
import _ from 'lodash';


const app = Express();
app.disable('x-powered-by');
app.use(Express.json());
app.use(CORS({maxAge: 600}));


// Gets the minimum valid Hyperpass version.
function getMinimumVersion(rawRequest: Express.Request,
	result: Express.Response): void { result.send('2021.4.12'); }


// Creates a new user account.
async function createAccount(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.createAccountRequestSchema) as Types.CreateAccountRequest;

	// Make sure an account with the given email address does not already exist.
	const accounts = await Database.getAccounts();
	const findResult = await accounts.findOne({emailAddress: request.emailAddress});

	if(findResult) throw new Types.ApiError('An account '+
		'with this email address already exists.', 409);

	// Add the account to the database.
	await accounts.insertOne
	({
		_id: new MongoDB.ObjectID(),
		version: request.version,
		emailAddress: request.emailAddress,
		validationKey: Crypto.randomBytes(32).toString('base64'),
		accessKey: request.accessKey,
		automaticLoginKeys: {},
		encryptedVault: request.encryptedVault
	});

	// Send the success response.
	Response.success(result);
}


// Sends the the given account's public information.
async function getPublicInformation(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.getPublicDataRequestSchema) as Types.GetPublicDataRequest;

	// Send the account's public information.
	const account = await Database.getAccountUnsecured(request.emailAddress, false);

	result.send
	({
		validated: (account.validationKey === undefined),
		automaticLoginKey: Helpers.getAutomaticLoginKey(request.deviceId, account)?.key,
		encryptedAccessKey: account.accessKey.encrypted
	});
}


// Sends an account validation email.
async function sendAccountValidationEmail(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.securedRequestSchema) as Types.SecuredRequest;

	// Make sure the account has not already been validated.
	const account = await Database.getAccount(request.accessData, false);

	if(account.validationKey === undefined) throw new Types.ApiError(
		'The account has already been validated.', 409);

	// Send the email.
	Helpers.sendEmail('account-validation.html', 'Welcome to Hyperpass',
		account.emailAddress, {accountValidationKey: account.validationKey});

	// Send the success response.
	Response.success(result);
}


// Validates the given user account.
async function validateAccount(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.validateAccountRequestSchema) as Types.ValidateAccountRequest;

	// Check that the validation key matches.
	const account = await Database.getAccount(request.accessData, false);

	if(request.validationKey !== account.validationKey)
		throw new Types.ApiError('Invalid account validation key.', 400);

	// Validate the account.
	const accounts = await Database.getAccounts();
	accounts.updateOne({_id: account._id}, {$unset: {validationKey: true}});

	// Send the success response.
	Response.success(result);
}


// Sends the the given account's encrypted vault.
async function getVault(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.securedRequestSchema) as Types.SecuredRequest;

	// Send the encrypted vault.
	const account = await Database.getAccount(request.accessData);
	result.json(account.encryptedVault);
}


// Stores the given encrypted vault.
async function setVault(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.setVaultRequestSchema) as Types.SetVaultRequest;

	// Set the vault.
	const account = await Database.getAccount(request.accessData);
	const accounts = await Database.getAccounts();

	accounts.updateOne({_id: account._id},
		{$set: {encryptedVault: request.encryptedVault}});

	// Send the success response.
	Response.success(result);
}


// Sets the automatic login key.
async function setAutomaticLoginKey(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.setAutomaticLoginKeyRequestSchema) as Types.SetAutomaticLoginKeyRequest;

	// Make sure an automatic login key is either given or cached.
	const account = await Database.getAccount(request.accessData);
	const accounts = await Database.getAccounts();
	let key = Helpers.getAutomaticLoginKey(request.deviceId, account)?.key;

	if(!key)
	{
		if(request.key) key = request.key;
		else throw new Types.ApiError('No automatic login key.');
	}

	// Set the automatic login key.
	const automaticLoginKey: Types.AutomaticLoginKey =
	{
		key,
		duration: request.duration ?? null,
		date: new Date()
	};

	accounts.updateOne({_id: account._id}, {$set:
		{[`automaticLoginKeys.${request.deviceId}`]: automaticLoginKey}});

	// Send the success response.
	Response.success(result);
}


// Logs out on the given device.
async function logOut(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.logoutRequestSchema) as Types.LogoutRequest;

	// Update the key.
	const account = await Database.getAccount(request.accessData);
	const accounts = await Database.getAccounts();

	accounts.updateOne({_id: account._id},
		{$unset: {[`automaticLoginKeys.${request.deviceId}`]: true}});

	// Send the success response.
	Response.success(result);
}


// Logs out on all devices.
async function globalLogout(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.globalLogoutRequestSchema) as Types.GlobalLogoutRequest;

	// Update the key.
	const account = await Database.getAccount(request.accessData);
	const accounts = await Database.getAccounts();

	accounts.updateOne({_id: account._id},
		{$set: {accessKey: request.newAccessKey, automaticLoginKeys: {}}});

	// Send the success response.
	Response.success(result);
}


// Changes the master password.
async function changeMasterPassword(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Validate the request's format.
	const request = Validation.validate(rawRequest,
		Validation.changeMasterPasswordRequestSchema) as Types.ChangeMasterPasswordRequest;

	// Set the access key, encrypted access key, and encrypted vault.
	const account = await Database.getAccount(request.accessData);
	const accounts = await Database.getAccounts();

	accounts.updateOne({_id: account._id}, {$set:
	{
		accessKey: request.newAccessKey,
		encryptedVault: request.newEncryptedVault
	}});

	// Send the success response.
	Response.success(result);
}


// Requests.
app.get('/get-minimum-version', getMinimumVersion);
app.post('/create-account', Helpers.wrapAsync(createAccount));
app.post('/get-public-information', Helpers.wrapAsync(getPublicInformation));
app.post('/send-account-validation-email', Helpers.wrapAsync(sendAccountValidationEmail));
app.post('/validate-account', Helpers.wrapAsync(validateAccount));

app.post('/get-vault', Helpers.wrapAsync(getVault));
app.post('/set-vault', Helpers.wrapAsync(setVault));
app.post('/set-automatic-login-key', Helpers.wrapAsync(setAutomaticLoginKey));
app.post('/change-master-password', Helpers.wrapAsync(changeMasterPassword));
app.post('/log-out', Helpers.wrapAsync(logOut));
app.post('/global-logout', Helpers.wrapAsync(globalLogout));

app.use((request, result) => { result.status(404).end(); });


// Main.
function main(): void
{
	// Load the environment variables.
	Dotenv.config();

	// Start Express.
	if(!process.env.PORT) throw new Error('No port environment variable.');
	console.log(`Starting Express on port ${process.env.PORT}.`);
	app.listen(process.env.PORT);
}

main();
