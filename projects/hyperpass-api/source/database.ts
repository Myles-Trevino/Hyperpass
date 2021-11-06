/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import * as MongoDB from 'mongodb';

import {Types as CommonTypes} from 'builds/hyperpass-common';

import * as Types from './types';


let database: MongoDB.Db | undefined = undefined;


// Retrieves the database.
export async function getDatabase(): Promise<MongoDB.Db>
{
	if(!database)
	{
		if(!process.env.MONGODB_URI)
			throw new Error('No MongoDB URI environment variable.');

		console.log('Connecting to MongoDB.');
		database = (await MongoDB.MongoClient.connect(process.env.MONGODB_URI)).db();
		console.log('Database retrieved.');
	}

	return database;
}


// Retrieves the collection of the specified name.
export async function getCollection<T>(name: string): Promise<MongoDB.Collection<T>>
{ return (await getDatabase()).collection(name); }


// Retrieves the collection of user accounts.
export function getAccounts(): Promise<MongoDB.Collection<Types.Account>>
{ return getCollection('users'); }


// Returns the account that matches the given email address,
// optionally checking if the account is validated.
export async function getAccountUnsecured(emailAddress: string,
	checkValidation = true): Promise<Types.Account>
{
	const accounts = await getAccounts();
	const account = await accounts.findOne({emailAddress: emailAddress.toLowerCase()});

	if(!account) throw new Types.ApiError('No account with this email address exists.');

	if(checkValidation && account.validationKey)
		throw new Types.ApiError('Not validated.', 403);

	return account;
}


// Returns the account that matches the given email, checking that the
// access key matches and optionally checking if the user is validated.
export async function getAccount(accessData: CommonTypes.AccessData,
	checkValidation = true): Promise<Types.Account>
{
	const account = await getAccountUnsecured(accessData.emailAddress, checkValidation);

	if(accessData.accessKey !== account.accessKey.value)
		throw new Types.ApiError('Invalid access key.');

	return account;
}
