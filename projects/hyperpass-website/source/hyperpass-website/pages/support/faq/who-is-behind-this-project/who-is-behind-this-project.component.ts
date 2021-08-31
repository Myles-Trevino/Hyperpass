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
	selector: 'hyperpass-who-is-behind-this-project',
	templateUrl: './who-is-behind-this-project.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhoIsBehindThisProjectComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';

	public readonly constants = Constants;


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Who is Behind This Project? - Support');
		this.metadataService.setDescription('A message from the creator of Hyperpass.');
		this.metadataService.setImage('support');
	}
}
