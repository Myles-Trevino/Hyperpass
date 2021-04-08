/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';

import {ThemeService, MetadataService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-importing-existing-accounts',
	templateUrl: './importing-existing-accounts.component.html',
	styleUrls: ['../../support.component.scss']
})

export class ImportingExistingAccountsComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Importing Existing Accounts - Support');
		this.metadataService.setDescription(
			'How to import your existing accounts into Hyperpass.');
		this.metadataService.setImage('support');
	}
}
