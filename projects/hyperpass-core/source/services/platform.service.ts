/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import * as Ionic from '@ionic/angular';
import * as Capacitor from '@capacitor/core';


@Injectable({providedIn: 'root'})

export class PlatformService
{
	public os: Capacitor.OperatingSystem = 'unknown';
	public isMobile = false;
	public isServer = isPlatformServer(this.platformId);


	// Constructor.
	public constructor(
		@Inject(PLATFORM_ID) private readonly platformId: Object,
		private readonly ionicPlatform: Ionic.Platform){}


	// Initializer.
	public async initialize(): Promise<void>
	{
		this.os = (await Capacitor.Plugins.Device.getInfo()).operatingSystem;
		this.isMobile = this.ionicPlatform.is('mobile');
	}
}
