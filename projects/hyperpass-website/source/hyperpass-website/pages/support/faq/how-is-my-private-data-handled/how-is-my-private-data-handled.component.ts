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
	selector: 'hyperpass-how-is-my-private-data-handled',
	templateUrl: './how-is-my-private-data-handled.component.html',
	styleUrls: ['../../support.component.scss']
})

export class HowIsMyPrivateDataHandledComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';

	public readonly constants = Constants;


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('How is My Private Data Handled? - Support');
		this.metadataService.setDescription(
			'Learn about how your private data is handled in Hyperpass.');
		this.metadataService.setImage('support');
	}
}
