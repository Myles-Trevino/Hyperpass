/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {SplashScreen} from '@capacitor/splash-screen';

import {InitializationService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-mobile-root',
	templateUrl: 'hyperpass-mobile.component.html'
})

export class HyperpassMobileComponent implements OnInit
{
	// Constructor.
	public constructor(public readonly initializationService: InitializationService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.initializationService.initialize();
		SplashScreen.hide();
	}
}
