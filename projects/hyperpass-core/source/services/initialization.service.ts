/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import * as _ from 'lodash';

import {Constants, Utilities} from 'builds/hyperpass-common';

import {ThemeService} from './theme.service';
import {CryptoService} from './crypto.service';
import {PlatformService} from './platform.service';
import {ApiService} from './api.service';
import {MessageService} from './message.service';
import {StateService} from './state.service';


@Injectable({providedIn: 'root'})

export class InitializationService
{
	public initialized = false;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly apiService: ApiService,
		private readonly themeService: ThemeService,
		private readonly cryptoService: CryptoService,
		private readonly messageService: MessageService,
		private readonly platformService: PlatformService,
		private readonly stateService: StateService){}


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

		// Set the theme.
		await this.themeService.setTheme();

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

			if(Utilities.naturalCompare(Constants.version, minimumVersion) < 0)
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


	// Reinitializes the core.
	public async reinitialize(): Promise<void>
	{
		this.stateService.restoreDefaults();
		this.initialized = false;
		await this.initialize();
		this.router.navigate(['/app']);
	}
}
