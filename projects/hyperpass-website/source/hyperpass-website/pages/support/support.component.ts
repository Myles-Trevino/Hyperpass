/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {RouterLink} from '@angular/router';

import {MetadataService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-support',
	templateUrl: './support.component.html',
	styleUrls: ['./support.component.scss'],
	imports: [RouterLink]
})

export class SupportComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Support');
		this.metadataService.setDescription('Learn about Hyperpass '+
			'with the introduction guide and topic-specific articles.');
		this.metadataService.setImage('support');
	}
}
