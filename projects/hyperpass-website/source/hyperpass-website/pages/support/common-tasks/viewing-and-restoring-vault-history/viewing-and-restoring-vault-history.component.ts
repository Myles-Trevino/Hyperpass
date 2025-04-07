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
	selector: 'hyperpass-viewing-and-restoring-vault-history',
	templateUrl: './viewing-and-restoring-vault-history.component.html',
	styleUrls: ['../../support.component.scss'],
	imports: [ImageLoaderComponent]
})

export class ViewingAndRestoringVaultHistoryComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Viewing and Restoring Vault History - Support');
		this.metadataService.setDescription(
			'How to view and restore vault history in Hyperpass.');
		this.metadataService.setImage('support');
	}
}
