/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {SplashScreen} from '@capacitor/splash-screen';

import {InitializationService, ThemeService, HyperpassCoreModule} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-mobile-root',
	templateUrl: 'hyperpass-mobile.component.html',
	imports: [NgIf, RouterOutlet, HyperpassCoreModule]
})

export class HyperpassMobileComponent implements OnInit
{
	// Constructor.
	public constructor(public readonly initializationService: InitializationService,
		private readonly themeService: ThemeService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.initializationService.initialize();
		await SplashScreen.hide();

		// Temporary fix for Capacitor failing to set status bar attributes on Android 13+.
		setTimeout(() => { this.themeService.applyTheme(); }, 500);
	}
}
