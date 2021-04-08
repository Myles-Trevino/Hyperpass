/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';

import {MetadataService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-which-technologies-does-hyperpass-use',
	templateUrl: './which-technologies-does-hyperpass-use.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhichTechnologiesDoesHyperpassUseComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Which Technologies Does Hyperpass Use? - Support');
		this.metadataService.setDescription(
			'Learn about the technologies that were used to create Hyperpass.');
		this.metadataService.setImage('support');
	}
}
