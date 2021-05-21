/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import * as Ionic from '@ionic/angular';
import * as Capacitor from '@capacitor/core';

import * as Settings from '../settings';
import {StorageService} from './storage.service';
import {CryptoService} from './crypto.service';


@Injectable({providedIn: 'root'})

export class PlatformService
{
	public deviceId?: string;
	public os: Capacitor.OperatingSystem = 'unknown';
	public isMobile = false;
	public isServer = isPlatformServer(this.platformId);
	public isExtension = false;


	// Constructor.
	public constructor(@Inject(PLATFORM_ID) private readonly platformId: Object,
		private readonly ionicPlatform: Ionic.Platform,
		private readonly storageService: StorageService,
		private readonly cryptoService: CryptoService){}


	// Initializer.
	public async initialize(): Promise<void>
	{
		// Load or generate the device ID.
		this.deviceId = await this.storageService.getData(Settings.deviceIdKey);

		if(!this.deviceId)
		{
			this.deviceId = this.cryptoService.randomBytes(Settings.keyLength);
			await this.storageService.setData(Settings.deviceIdKey, this.deviceId);
		}

		// Load the OS and platform type.
		this.os = (await Capacitor.Plugins.Device.getInfo()).operatingSystem;
		this.isMobile = this.ionicPlatform.is('mobile');
	}
}
