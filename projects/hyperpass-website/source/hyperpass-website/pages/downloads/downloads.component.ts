/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';

import {Constants, MetadataService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-downloads',
	templateUrl: './downloads.component.html',
	styleUrls: ['./downloads.component.scss']
})

export class DownloadsComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';

	public readonly constants = Constants;


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Downloads');
		this.metadataService.setDescription('The download page for the '+
			'Hyperpass browser extensions, mobile apps, and desktop apps.');
		this.metadataService.setImage('downloads');
	}
}
