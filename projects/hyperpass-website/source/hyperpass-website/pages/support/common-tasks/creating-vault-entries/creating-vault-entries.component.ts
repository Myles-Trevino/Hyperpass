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
	selector: 'hyperpass-creating-vault-entries',
	templateUrl: './creating-vault-entries.component.html',
	styleUrls: ['../../support.component.scss']
})

export class CreatingVaultEntriesComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Creating Vault Entries - Support');
		this.metadataService.setDescription('How to create vault entries in Hyperpass.');
		this.metadataService.setImage('support');
	}
}
