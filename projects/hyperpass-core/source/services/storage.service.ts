/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Preferences} from '@capacitor/preferences';


@Injectable({providedIn: 'root'})

export class StorageService
{
	// Gets the data under the given key from storage.
	public async getData(key: string): Promise<string | undefined>
	{
		const result = await Preferences.get({key});
		return result.value ?? undefined;
	}


	// Saves the given data under the given key in storage.
	public async setData(key: string, value: string): Promise<void>
	{ await Preferences.set({key, value}); }
}
