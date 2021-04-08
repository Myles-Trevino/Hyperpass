/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import * as Ionic from '@ionic/angular';


@Injectable({providedIn: 'root'})

export class PlatformService
{
	// Constructor.
	public constructor(
		@Inject(PLATFORM_ID) private readonly platformId: Object,
		private readonly ionicPlatform: Ionic.Platform){}


	// Checks whether the platform is mobile.
	public isMobile(): boolean { return this.ionicPlatform.is('mobile'); }


	// Checks whether the platform is the server or the browser.
	public isServer(): boolean { return isPlatformServer(this.platformId); }
}
