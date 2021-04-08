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
	selector: 'hyperpass-which-apps-and-extensions-should-i-use',
	templateUrl: './which-apps-and-extensions-should-i-use.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhichAppsAndExtensionsShouldIUseComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Which Apps and Extensions Should I Use? - Support');
		this.metadataService.setDescription(
			'Discover which Hyperpass apps and extensions work for you.');
		this.metadataService.setImage('support');
	}
}
