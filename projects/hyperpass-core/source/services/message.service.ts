/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';

import {Types} from 'builds/hyperpass-common';


@Injectable({providedIn: 'root'})

export class MessageService
{
	public readonly messages = new Subject<Types.MessageData>();


	// Sends a normal message.
	public message(message: string, duration = 5): void
	{ this.messages.next({message, type: 'Normal', duration}); }


	// Sends an error message.
	public error(error: Error | HttpErrorResponse, duration = 7): void
	{
		// Log the error.
		console.log(error);

		// Create the base message.
		let message = '';

		if(error instanceof HttpErrorResponse)
		{
			// If it is a progress error, send an appropriate message.
			if(error.error instanceof ProgressEvent)
				message = 'Could not complete the request.';

			// Otherwise, assume the error is a string.
			else
			{
				// API error message.
				const errorMessage = error.error as string;
				if(!errorMessage.includes('html')) message = errorMessage;

				// Other error message - rely on the status code.
				else
				{
					if(error.status === 404) message = `Not found.`;

					if(error.status === 503) message = `You have made too many requests of this type. Please try again later.`;

					else message = `${error.status} Error.`;
				}
			}
		}

		else message = error.message;

		// Send the error message.
		this.messages.next({message, type: 'Error', duration});
	}
}
