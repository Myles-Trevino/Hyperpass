/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../types';
import * as Constants from '../constants';
import {ThemeService} from './theme.service';
import {CryptoService} from './crypto.service';
import {StorageService} from './storage.service';
import {PlatformService} from './platform.service';
import {ApiService} from './api.service';
import {MessageService} from './message.service';
import {StateService} from './state.service';
import {UtilityService} from './utility.service';


@Injectable({providedIn: 'root'})

export class InitializationService
{
	public initialized = false;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly apiService: ApiService,
		private readonly themeService: ThemeService,
		private readonly cryptoService: CryptoService,
		private readonly storageService: StorageService,
		private readonly messageService: MessageService,
		private readonly platformService: PlatformService,
		private readonly stateService: StateService,
		private readonly utilityService: UtilityService){}


	// Initializes the core.
	public async initialize(): Promise<void>
	{
		// If this is the server, skip normal initialization.
		if(this.platformService.isServer)
		{
			this.initialized = true;
			return;
		}

		// Initialize the cryptography service.
		await this.cryptoService.initialize();

		// Load platform information.
		await this.platformService.initialize();

		// If there is a cached theme, apply it.
		const cachedTheme = await this.storageService.getData(Constants.themeKey);

		if(cachedTheme && Types.isTheme(cachedTheme))
			await this.themeService.setTheme(cachedTheme);

		// Otherwise, set the theme based on the OS preference.
		else await this.themeService.setTheme();

		// Keep track of route changes.
		this.router.events.subscribe((event) =>
		{
			if(!(event instanceof NavigationStart) ||
				!event.url.startsWith('/app')) return;

			this.stateService.app.route = event.url;
		});

		// Check the version and check if offline.
		try
		{
			const minimumVersion = await this.apiService.getMinimumVersion();
			this.stateService.isOnline = true;

			if(this.utilityService.naturalCompare(Constants.version, minimumVersion) < 0)
			{
				this.messageService.error(new Error('This version of Hyperpass is '+
					'out of date. Please install the latest version to continue.'), 0);
				return;
			}
		}

		// If offline, ignore the error.
		catch(error: unknown){}

		// Set the initialized flag.
		this.initialized = true;
	}
}
