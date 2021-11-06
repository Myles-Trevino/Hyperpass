/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import * as _ from 'lodash';

import type * as Types from './types';


// Sleeps for the given duration in milliseconds.
export function sleep(milliseconds?: number): Promise<void>
{ return new Promise((resolve) => { setTimeout(resolve, milliseconds); }); }


// Checks whether the given number is within the given range.
export function isWithinRange(x: number, minimum: number,
	maximum: number, error: string): number
{
	if(isNaN(x) || x < minimum || x > maximum) throw new Error(error);
	return x;
}


// Appends the unique given entries to the given existing entries,
// enumerating the new entry's key if necessary.
export function uniqueAppend<T>(newEntries: Record<string, T>,
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

		else existingEntries[merge ? key : generateUniqueKey(key, existingEntries)] = value;
	}

	// Return.
	return existingEntries;
}


// Generates a unique key using the given base and enumeration.
export function generateUniqueKey<T>(base: string, entries: Record<string, T>): string
{
	return generateUniqueName(base, entries, (name, _entries) => _.has(_entries, name));
}


// Generates a unique name using the given base and enumeration.
export function generateUniqueName<T>(base: string, entries: T,
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
export function naturalCompare(a: string, b: string): number
{ return a.localeCompare(b, undefined, {sensitivity: 'base', numeric: true}); }


// Natural sort.
export function naturalSort<T>(array: T[], getKey: (item: T) => string): T[]
{ return array.sort((a, b) => naturalCompare(getKey(a), getKey(b))); }


// Trims the given URL.
export function trimUrl(url: string): string
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


// Returns whether the URL is an internal browser URL.
export function isInternalUrl(url: string): boolean
{
	return url.startsWith('chrome:') ||
		url.startsWith('edge:') ||
		url.startsWith('about:');
}


// Checks whether the given account matches the given website.
export function accountMatchesWebsite(account: Types.Account, website: string): boolean
{
	const urls = account.url.split(',');

	for(let url of urls)
	{
		url = url.trim();
		if(url && website.includes(url)) return true;
	}

	return false;
}
