/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {isPlatformServer, formatDate} from '@angular/common';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../types';
import * as Settings from '../settings';
import {ThemeService} from './theme.service';
import {CryptoService} from './crypto.service';
import {GeneratorService} from './generator.service';
import {StorageService} from './storage.service';


@Injectable({providedIn: 'root'})

export class UtilityService
{
	public readonly updateVaultSubject = new Subject<void>();


	// Constructor.
	public constructor(
		@Inject(PLATFORM_ID) private readonly platformId: Object,
		private readonly route: ActivatedRoute,
		private readonly themeService: ThemeService,
		private readonly cryptoService: CryptoService,
		private readonly generatorService: GeneratorService,
		private readonly storageService: StorageService){}


	// Initializes Hyperpass.
	public async initialize(): Promise<void>
	{
		// If there is a cached theme, apply it.
		const cachedTheme = await this.storageService.getData(Settings.themeKey);

		if(cachedTheme && Types.isTheme(cachedTheme))
			await this.themeService.setTheme(cachedTheme);

		// Otherwise, set the theme based on the OS preference.
		else await this.themeService.setTheme();

		// Initialize services.
		await this.cryptoService.initialize();
		await this.generatorService.initialize();
	}


	// Checks whether the platform is the server or the browser.
	public isServer(): boolean { return isPlatformServer(this.platformId); }


	// Sleeps for the given duration in milliseconds.
	public sleep(milliseconds?: number): Promise<void>
	{ return new Promise((resolve) => { setTimeout(resolve, milliseconds); }); }


	// Checks whether the given number is within the given range.
	public isWithinRange(x: number, minimum: number,
		maximum: number, error: string): number
	{
		if(isNaN(x) || x < minimum || x > maximum) throw new Error(error);
		return x;
	}


	// Loads the URL parameter with the given key.
	public loadUrlParameter(key: string): string | undefined
	{
		const parameter = this.route.snapshot.queryParamMap.get(key);
		return parameter ?? undefined;
	}


	// Returns the current date as a string.
	public dateToString(date: Date): string
	{ return formatDate(date, 'y-M-d h:mm:ss a', 'en'); }


	// Appends the unique given entries to the given existing entries,
	// enumerating the new entry's key if necessary.
	public uniqueAppend<T>(newEntries: Record<string, T>,
		existingEntries: Record<string, T>, duplicateCallback?: (a: T, b: T) => boolean,
		merge = false): Record<string, T>
	{
		for(const [key, value] of Object.entries(newEntries))
		{
			// If the new entry is a complete duplicate of an existing one, skip it.
			if(duplicateCallback && existingEntries.hasOwnProperty(key) &&
				duplicateCallback(value, existingEntries[key])) continue;

			// Otherwise, if not merging, make sure the key is unique.
			let finalKey = key;
			let enumerator = 2;

			if(!merge)
				while(existingEntries.hasOwnProperty(finalKey))
				{
					finalKey = `${key} ${enumerator}`;
					++enumerator;
				}

			// Add the entry.
			existingEntries[finalKey] = value;
		}

		// Return.
		return existingEntries;
	}


	// Natural sort.
	public naturalSort<T>(array: T[], getKey: (item: T) => string): T[]
	{
		return array.sort((a, b) =>
		{
			return getKey(a).localeCompare(getKey(b), undefined,
				{sensitivity: 'base', numeric: true});
		});
	}


	// Domain extraction.
	public extractDomain(url: string): string
	{
		const start = url.indexOf('://')+3;
		return url.substring(start, url.indexOf('/', start)).replace('www.', '');
	}


	// Return 0 for disabling Angular keyvalue pipe sorting.
	public returnZero(): number { return 0; }
}
