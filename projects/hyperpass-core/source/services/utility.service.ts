/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {formatDate} from '@angular/common';
import * as _ from 'lodash';

import {Types, Constants} from 'builds/hyperpass-common';


@Injectable({providedIn: 'root'})

export class UtilityService
{
	// Constructor.
	public constructor(private readonly router: Router,
		private readonly route: ActivatedRoute){}


	// Loads the URL parameter with the given key.
	public loadUrlParameter(key: string): string | undefined
	{
		const parameter = this.route.snapshot.queryParamMap.get(key);
		return parameter ?? undefined;
	}


	// Returns the current date as a string.
	public dateToString(date: Date): string
	{ return formatDate(date, 'y-M-d h:mm:ss a', 'en'); }


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
