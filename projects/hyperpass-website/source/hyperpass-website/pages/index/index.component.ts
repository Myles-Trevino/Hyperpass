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
	selector: 'hyperpass-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})

export class IndexComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle();
		this.metadataService.setDescription('A modern, unified password manager.');
		this.metadataService.setImage('hyperpass');
	}
}
