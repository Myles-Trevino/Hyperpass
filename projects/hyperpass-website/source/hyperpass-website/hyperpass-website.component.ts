/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {NgStyle, NgIf} from '@angular/common';
import {RouterOutlet} from '@angular/router';

import {Animations, InitializationService, MessageComponent, PlatformService} from 'hyperpass-core';
import {NavbarComponent} from './navbar/navbar.component';


@Component
({
	selector: 'hyperpass-website-root',
	templateUrl: './hyperpass-website.component.html',
	animations: [Animations.initialFadeInAnimation],
		imports: [RouterOutlet, NgStyle, NgIf, NavbarComponent, MessageComponent]
})

export class HyperpassWebsiteComponent implements OnInit
{
	public server?: boolean;


	// Constructor.
	public constructor(
		public readonly initializationService: InitializationService,
		public readonly platformService: PlatformService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.initializationService.initialize();
	}
}
