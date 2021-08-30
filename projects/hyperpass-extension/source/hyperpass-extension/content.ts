/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import browser from 'webextension-polyfill';

import type {Types} from 'hyperpass-core';


// Command callback.
browser.runtime.onMessage.addListener((message: Types.Message) =>
{ if(message.type === 'Autofill') autofill(message.data as string); });


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
