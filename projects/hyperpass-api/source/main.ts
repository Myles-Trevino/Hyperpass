/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import Express from 'express';
import Dotenv from 'dotenv';
import Crypto from 'crypto';
import * as MongoDB from 'mongodb';
import Cors from 'cors';
import _ from 'lodash';

import * as Types from './types';
import * as Helpers from './helpers';
import * as Response from './response';
import * as Validation from './validation';
import * as Database from './database';


// Load the environment variables.
Dotenv.config();

// Initialize Express.
const app = Express();
app.disable('x-powered-by');
app.use(Express.json());

// Add the CORS headers if enabled.
if(process.env.ENABLE_CORS === 'true') app.use(Cors
({
	origin: '*',
	methods: ['POST', 'GET', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
	maxAge: 600
}));


// Gets the minimum valid Hyperpass version.
function getMinimumVersion(rawRequest: Express.Request,
	result: Express.Response): void { result.send('2021.4.19'); }


// Creates a new user account.
async function createAccount(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.createAccountRequestSchema) as Types.CreateAccountRequest;

	// Make sure an account with the given email address does not already exist.
	const accounts = await Database.getAccounts();
	const findResult = await accounts.findOne(
		{emailAddress: request.emailAddress.toLowerCase()});

	if(findResult) throw new Types.ApiError('An account '+
		'with this email address already exists.', 409);

	// Create the new account.
	const account: Types.Account =
	{
		_id: new MongoDB.ObjectId(),
		version: request.version,
		emailAddress: request.emailAddress.toLowerCase(),
		accessKey: request.accessKey,
		automaticLoginKeys: {},
		encryptedVault: request.encryptedVault
	};

	// If validation is not disabled, add a validation key.
	if(process.env.DISABLE_VALIDATION !== 'true')
		account.validationKey = Crypto.randomBytes(32).toString('base64');

	// Add the account to the database.
	await accounts.insertOne(account);

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
	Helpers.sendEmail('Welcome to Hyperpass', account.emailAddress,
		{
			preview: `Welcome to Hyperpass! For your security, you must validate your account before you can start using it.`,
			body: `<p style="margin: 0;">Welcome to Hyperpass!</p></br></br><p style="margin: 0;">For your security, you must validate your account before you can start using it.</br></br>Your account validation key is below.</p></br></br><p style="margin: 0;">${account.validationKey}</p>`
		});

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
		duration: request.duration,
		date: new Date()
	};

	accounts.updateOne({_id: account._id}, {$set:
		{[`automaticLoginKeys.${request.deviceId}`]: automaticLoginKey}});

	// Delete outdated automatic login keys.
	Helpers.deleteOutdatedAutomaticLoginKeys(account, accounts);

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


// Changes the email address.
async function changeEmailAddress(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Validate the request's format.
	const request = Validation.validate(rawRequest,
		Validation.changeEmailAddressRequestSchema) as Types.ChangeEmailAddressRequest;

	// Check that the validation key matches.
	const account = await Database.getAccount(request.accessData, false);

	if(!account.emailAddressValidationKey ||
		request.emailAddress !== account.emailAddressValidationKey.emailAddress ||
		request.validationKey !== account.emailAddressValidationKey.validationKey)
		throw new Types.ApiError('Invalid email address validation key.', 400);

	// Change the email address.
	const accounts = await Database.getAccounts();
	accounts.updateOne({_id: account._id}, {$set: {emailAddress: request.emailAddress}});

	// Send the success response.
	Response.success(result);
}


// Send an email address validation email.
async function sendEmailAddressValidationEmail(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Parse the request.
	const request = Validation.validate(rawRequest,
		Validation.sendEmailAddressValidationEmailRequestSchema) as Types.SendEmailAddressValidationEmailRequest;

	// Make sure the email address is not in use.
	const accounts = await Database.getAccounts();
	const findResult = await accounts.findOne(
		{emailAddress: request.emailAddress.toLowerCase()});

	if(findResult) throw new Types.ApiError('This email address is already in use.', 409);

	// Generate the validation key.
	const emailAddressValidationKey: Types.EmailAddressValidationKey =
	{
		emailAddress: request.emailAddress,
		validationKey: Crypto.randomBytes(32).toString('base64')
	};

	const account = await Database.getAccount(request.accessData);
	accounts.updateOne({_id: account._id}, {$set: {emailAddressValidationKey}});

	// Send the email.
	Helpers.sendEmail('Welcome to Hyperpass', request.emailAddress,
		{
			preview: `You must validate that this email address is yours before you can start using it with Hyperpass.`,
			body: `<p style="margin: 0;">You must validate that this email address is yours before you can start using it with Hyperpass.</br></br>Your email address validation key is below.</p></br></br><p style="margin: 0;">${emailAddressValidationKey.validationKey}</p>`
		});

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


// Deletes the account.
async function deleteAccount(rawRequest: Express.Request,
	result: Express.Response): Promise<void>
{
	// Validate the request's format.
	const request = Validation.validate(rawRequest,
		Validation.securedRequestSchema) as Types.SecuredRequest;

	// Delete the account.
	const account = await Database.getAccount(request.accessData, false);
	const accounts = await Database.getAccounts();

	accounts.deleteOne({_id: account._id});

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
app.post('/change-email-address', Helpers.wrapAsync(changeEmailAddress));
app.post('/send-email-address-validation-email',
	Helpers.wrapAsync(sendEmailAddressValidationEmail));
app.post('/log-out', Helpers.wrapAsync(logOut));
app.post('/global-logout', Helpers.wrapAsync(globalLogout));
app.post('/delete-account', Helpers.wrapAsync(deleteAccount));

app.use((request, result) => { result.status(404).end(); });


// Main.
function main(): void
{
	// Start Express.
	if(!process.env.PORT) throw new Error('No port environment variable.');
	console.log(`Starting Express on port ${process.env.PORT}.`);
	app.listen(process.env.PORT);
}

main();
