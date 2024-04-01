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
	selector: 'hyperpass-how-do-i-delete-my-account',
	templateUrl: './how-do-i-delete-my-account.component.html',
	styleUrls: ['../../support.component.scss']
})

export class HowDoIDeleteMyAccountComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('How Do I Delete My Account? - Support');
		this.metadataService.setDescription(
			'Guidance on how to delete your Hyperpass account.');
		this.metadataService.setImage('support');
	}
}
