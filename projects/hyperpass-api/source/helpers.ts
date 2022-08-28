/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import FS from 'fs';
import type Express from 'express';
import * as MongoDB from 'mongodb';
import Handlebars from 'handlebars';
import Nodemailer from 'nodemailer';
import * as DateFns from 'date-fns';
import * as _ from 'lodash';

import type * as Types from './types';
import * as Response from './response';


// Async wrapper.
export function wrapAsync(handler: (request: Express.Request,
	response: Express.Response) => Promise<void>): Express.RequestHandler
{
	return (request: Express.Request, response: Express.Response): void =>
	{
		handler(request, response).catch(
			(error: unknown) => { Response.errorStatus(response, error); });
	};
}


// Returns the automatic login key for the given
// device ID, making sure that it has not expired.
export function getAutomaticLoginKey(deviceId: string,
	account: Types.Account): Types.AutomaticLoginKey | undefined
{
	// If there is no key for the given device ID, return undefined.
	const keys = account.automaticLoginKeys;
	if(!_.has(keys, deviceId)) return undefined;

	// If the key has expired, return undefined.
	const key = keys[deviceId];
	if(keyHasExpired(key)) return undefined;

	// Otherwise return the key.
	return key;
}


// Deletes any outdated automatic login keys.
export function deleteOutdatedAutomaticLoginKeys(
	account: Types.Account, accounts: MongoDB.Collection<Types.Account>): void
{
	for(const [key, value] of Object.entries(account.automaticLoginKeys))
		if(keyHasExpired(value)) accounts.updateOne({_id: account._id},
			{$unset: {[`automaticLoginKeys.${key}`]: true}});
}


// Sends an email.
export function sendEmail(subject: string,
	emailAddress: string, context: Record<string, unknown>): void
{
	// Load the email.
	const emailHtml = Handlebars.compile(FS.readFileSync(
		`./email-template.html`, 'utf-8'))(context);

	// Configure Nodemailer.
	if(!process.env.EMAIL_HOST || !process.env.EMAIL_PORT ||
		!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD)
		throw new Error('Missing email environment variables.');

	const transporter = Nodemailer.createTransport
	({
		host: process.env.EMAIL_HOST,
		port: Number.parseInt(process.env.EMAIL_PORT),
		secure: true,
		auth:
		{
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		}
	});

	// Send the email.
	transporter.sendMail
	({
		from: process.env.EMAIL_ADDRESS,
		to: emailAddress,
		subject,
		html: emailHtml,
		attachments:
		[{
			filename: 'logo.png',
			path: 'https://static.hyperpass.org/images/email-logo.png',
			cid: 'logo'
		}]
	});
}


// Checks if the given key has expired.
function keyHasExpired(key: Types.AutomaticLoginKey): boolean
{
	return DateFns.differenceInMilliseconds(
		new Date(), key.date) > key.duration*60*1000;
}
