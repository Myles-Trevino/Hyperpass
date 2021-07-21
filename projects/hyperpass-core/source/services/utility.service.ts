/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

import type * as Types from '../types';
import * as Constants from '../constants';


@Injectable({providedIn: 'root'})

export class UtilityService
{
	public readonly updateVaultSubject = new Subject<void>();


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly route: ActivatedRoute){}


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
		merge = false, mergeCallback?: (a: T, b: T) => T): Record<string, T>
	{
		for(const [key, value] of Object.entries(newEntries))
		{
			// If the new entry is a complete duplicate of an existing one, skip it.
			if(duplicateCallback && _.has(existingEntries, key) &&
				duplicateCallback(value, existingEntries[key])) continue;

			// Add the entry.
			if(merge && _.has(existingEntries, key) && mergeCallback)
				existingEntries[key] = mergeCallback(existingEntries[key], value);

			else existingEntries[merge ? key :
				this.generateUniqueKey(key, existingEntries)] = value;
		}

		// Return.
		return existingEntries;
	}


	// Generates a unique key using the given base and enumeration.
	public generateUniqueKey<T>(base: string, entries: Record<string, T>): string
	{
		return this.generateUniqueName(base, entries,
			(name, _entries) => _.has(_entries, name));
	}


	// Generates a unique name using the given base and enumeration.
	public generateUniqueName<T>(base: string, entries: T,
		isUnique: (name: string, entries: T) => boolean): string
	{
		let uniqueName = base;
		let enumerator = 2;

		while(isUnique(uniqueName, entries))
		{
			uniqueName = `${base} ${enumerator}`;
			++enumerator;
		}

		return uniqueName;
	}


	// Natural compare.
	public naturalCompare(a: string, b: string): number
	{
		return a.localeCompare(b, undefined, {sensitivity: 'base', numeric: true});
	}


	// Natural sort.
	public naturalSort<T>(array: T[], getKey: (item: T) => string): T[]
	{
		return array.sort((a, b) => this.naturalCompare(getKey(a), getKey(b)));
	}


	// Domain extraction.
	public extractDomain(url: string): string
	{
		const start = url.indexOf('://')+3;
		return url.substring(start, url.indexOf('/', start)).replace('www.', '');
	}


	// Trims the given URL.
	public trimUrl(url: string): string
	{
		// Make lowercase.
		url = url.toLowerCase();

		// Trim the protocol.
		const start = url.indexOf('://');
		if(start !== -1) url = url.substring(start+3);

		// Trim the path.
		const end = url.indexOf('/');
		if(end !== -1) url = url.substring(0, end);

		// Remove 'www.'.
		url = url.replace('www.', '');

		return url;
	}


	// Adds the given entry to vault entry history.
	public addToVaultEntryHistory(history: Types.VaultEntryHistoryEntry[],
		entry: string): Types.VaultEntryHistoryEntry[]
	{
		if(entry === '') return history;
		const result = _.cloneDeep(history);

		// Add the entry to history if it differs from the previous entry.
		if(result.length === 0 || result[0].entry !== entry)
			result.unshift({date: new Date(), entry});

		// Limit the number of entries.
		return result.slice(0, Constants.maximumHistoryEntries);
	}


	// Navigates back to the main route of the given page.
	public close(page: string): void
	{
		this.router.navigate(['/app', {outlets: {[page]: null}}],
			{skipLocationChange: true});
	}
}
