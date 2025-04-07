/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';

import {ThemeService, MetadataService} from 'hyperpass-core';
import {ImageLoaderComponent} from '../../../../image-loader/image-loader.component';


@Component
({
	selector: 'hyperpass-creating-and-restoring-vault-backups',
	templateUrl: './creating-and-restoring-vault-backups.component.html',
	styleUrls: ['../../support.component.scss'],
	imports: [ImageLoaderComponent]
})

export class CreatingAndRestoringVaultBackupsComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Creating and Restoring Vault Backups - Support');
		this.metadataService.setDescription(
			'How to create and restore vault backups in Hyperpass.');
		this.metadataService.setImage('support');
	}
}
