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
	selector: 'hyperpass-how-do-i-self-host-hyperpass',
	templateUrl: './how-do-i-self-host-hyperpass.component.html',
	styleUrls: ['../../support.component.scss']
})

export class HowDoISelfHostHyperpassComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';

	public readonly constants = Constants;


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('How do I Self-Host Hyperpass? - Support');
		this.metadataService.setDescription(
			'Learn how to get even more control over your data with self-hosting.');
		this.metadataService.setImage('support');
	}
}
