/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';

import type * as Types from '../types';


@Injectable({providedIn: 'root'})

export class MessageService
{
	public readonly messages = new Subject<Types.MessageData>();


	// Sends a normal message.
	public message(message: string, duration = 5): void
	{ this.messages.next({message, type: 'Normal', duration}); }


	// Sends an error message.
	public error(error: Error | HttpErrorResponse): void
	{
		// Log the error.
		console.log(error);

		// Create the base message.
		let message = '';

		if(error instanceof HttpErrorResponse)
		{
			if(error.error instanceof ProgressEvent)
				message = 'Could not complete the request.';

			else message = error.error as string;
		}

		else message = error.message;

		// Send the error message.
		this.messages.next({message, type: 'Error', duration: 7});
	}
}
