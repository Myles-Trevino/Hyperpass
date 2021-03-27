/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';

import {Animations, UtilityService} from 'hyperpass-core';
import {MetadataService} from './services/metadata.service';


@Component
({
	selector: 'hyperpass-website-root',
	templateUrl: './hyperpass-website.component.html',
	styleUrls: ['hyperpass-website.scss'],
	animations: [Animations.initialFadeAnimation]
})

export class HyperpassWebsiteComponent implements OnInit
{
	public server?: boolean;


	// Constructor.
	public constructor(private readonly metadataService: MetadataService,
		private readonly utilityService: UtilityService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Determine the platform.
		this.server = this.utilityService.isServer();
		if(this.server) return;

		// Initialize.
		this.utilityService.initialize();
		this.metadataService.initialize();
	}
}
