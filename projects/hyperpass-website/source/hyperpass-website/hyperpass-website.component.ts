/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';

import {Animations, UtilityService, PlatformService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-website-root',
	templateUrl: './hyperpass-website.component.html',
	animations: [Animations.initialFadeAnimation]
})

export class HyperpassWebsiteComponent implements OnInit
{
	public server?: boolean;


	// Constructor.
	public constructor(private readonly utilityService: UtilityService,
		private readonly platformService: PlatformService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Determine the platform.
		if(this.platformService.isServer) return;

		// Initialize.
		this.utilityService.initialize();
	}
}
