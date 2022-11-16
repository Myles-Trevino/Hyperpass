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
import {TextZoom} from '@capacitor/text-zoom';

import {Constants} from 'builds/hyperpass-common';

import {StorageService} from './storage.service';
import {CryptoService} from './crypto.service';


@Injectable({providedIn: 'root'})

export class PlatformService
{
	public apiServer = Constants.defaultApiServer;
	public deviceId?: string;
	public os: OperatingSystem = 'unknown';
	public isMobile = false;
	public isMobileApp = false;
	public isAndroidApp = false;
	public isIosApp = false;
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
		// Load the API server if one has been set.
		const cachedApiServer = await this.storageService.getData(Constants.apiServerKey);
		if(cachedApiServer) this.apiServer = cachedApiServer;

		// Load or generate the device ID.
		this.deviceId = await this.storageService.getData(Constants.deviceIdKey);

		if(!this.deviceId)
		{
			this.deviceId = this.cryptoService.randomBytes(Constants.keyLength);
			await this.storageService.setData(Constants.deviceIdKey, this.deviceId);
		}

		// Load the OS and platform type.
		this.os = (await Device.getInfo()).operatingSystem;
		this.isMobile = this.ionicPlatform.is('mobile') ||
			this.ionicPlatform.is('android') || this.ionicPlatform.is('ios');
		this.isMobileApp = this.isMobile && !this.ionicPlatform.is('mobileweb');
		this.isAndroidApp = this.isMobileApp && this.ionicPlatform.is('android');
		this.isIosApp = this.isMobileApp && this.ionicPlatform.is('ios');

		// Force text zoom to 100% to prevent UI issues.
		await TextZoom.set({value: 1});
	}
}
