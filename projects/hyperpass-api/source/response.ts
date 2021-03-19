/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import Express from 'express';

import * as Types from './types';


// Sets a success response.
export function success(result: Express.Response): void { result.end(); }


// Sends an error response.
export function errorStatus(response: Express.Response, error: unknown): void
{
	const apiError = error as Types.ApiError;
	const status = apiError.statusCode ? apiError.statusCode : 500;

	// Server errors.
	if(status === 500)
	{
		console.error(error);
		response.status(status).end();
	}

	// Request errors.
	else response.status(status).send(apiError.message);
}
