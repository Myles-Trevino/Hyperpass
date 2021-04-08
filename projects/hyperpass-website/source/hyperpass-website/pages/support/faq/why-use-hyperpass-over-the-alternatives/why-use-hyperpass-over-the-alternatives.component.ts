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
	selector: 'hyperpass-why-use-hyperpass-over-the-alternatives',
	templateUrl: './why-use-hyperpass-over-the-alternatives.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhyUseHyperpassOverTheAlternativesComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Why Use Hyperpass Over the Alternatives? - Support');
		this.metadataService.setDescription(
			'Learn about what sets Hyperpass apart from other password managers.');
		this.metadataService.setImage('support');
	}
}
