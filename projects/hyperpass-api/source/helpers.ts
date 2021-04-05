/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import FS from 'fs';
import type Express from 'express';
import Handlebars from 'handlebars';
import Nodemailer from 'nodemailer';

import * as Response from './response';


// Async wrapper.
export function wrapAsync(handler: (request: Express.Request,
	response: Express.Response) => Promise<void>): Express.RequestHandler
{
	return (request: Express.Request, response: Express.Response): void =>
	{
		handler(request.body, response).catch(
			(error: unknown) => { Response.errorStatus(response, error); });
	};
}


// Sends an email.
export function sendEmail(templateName: string, subject: string,
	emailAddress: string, context: Record<string, unknown>): void
{
	// Load the email.
	const emailHtml = Handlebars.compile(FS.readFileSync(
		`./email-templates/${templateName}`, 'utf-8'))(context);

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
			path: process.env.EMAIL_LOGO_URL,
			cid: 'logo'
		}]
	});
}
