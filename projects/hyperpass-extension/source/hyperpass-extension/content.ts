/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/

/* eslint-disable strict */
/* eslint-disable no-implicit-globals */

import browser from 'webextension-polyfill';

import type {Types} from 'builds/hyperpass-common';


// Command callback.
browser.runtime.onMessage.addListener((message: unknown) =>
{
	const typedMessage = message as Types.Message;
	if(typedMessage.type === 'Autofill') autofill(typedMessage.data as string);
});


// Fills the currently focused input element with the given string.
function autofill(value: string): void
{
	try
	{
		// Get the input element.
		if(!value) return;
		const element = document.querySelector<HTMLInputElement>('input:focus');
		if(!element) return;

		// Set the value.
		element.value = value;

		// Trigger related events.
		element.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true}));
		element.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
		element.dispatchEvent(new Event('input', {bubbles: true}));
	}

	// Handle errors.
	catch(error: unknown){ console.error('Hyperpass autofill failed.'); }
}
