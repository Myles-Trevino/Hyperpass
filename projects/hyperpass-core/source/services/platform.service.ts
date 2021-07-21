/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import * as Ionic from '@ionic/angular';
import type {OperatingSystem} from '@capacitor/device';
import {Device} from '@capacitor/device';

import * as Constants from '../constants';
import {StorageService} from './storage.service';
import {CryptoService} from './crypto.service';


@Injectable({providedIn: 'root'})

export class PlatformService
{
	public deviceId?: string;
	public os: OperatingSystem = 'unknown';
	public isMobile = false;
	public isMobileApp = false;
	public isServer = isPlatformServer(this.platformId);
	public isExtension = false;
	public isExtensionBackground = false;


	// Constructor.
	public constructor(@Inject(PLATFORM_ID) private readonly platformId: Object,
		private readonly ionicPlatform: Ionic.Platform,
		private readonly storageService: StorageService,
		private readonly cryptoService: CryptoService){}


	// Initializer.
	public async initialize(): Promise<void>
	{
		// Load or generate the device ID.
		this.deviceId = await this.storageService.getData(Constants.deviceIdKey);

		if(!this.deviceId)
		{
			this.deviceId = this.cryptoService.randomBytes(Constants.keyLength);
			await this.storageService.setData(Constants.deviceIdKey, this.deviceId);
		}

		// Load the OS and platform type.
		this.os = (await Device.getInfo()).operatingSystem;
		this.isMobile = this.ionicPlatform.is('mobile');
		this.isMobileApp = this.isMobile && !this.ionicPlatform.is('mobileweb');
	}
}
