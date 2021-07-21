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
import {GeneratorService} from './generator.service';
import {StorageService} from './storage.service';
import {PlatformService} from './platform.service';
import {ApiService} from './api.service';
import {MessageService} from './message.service';
import {StateService} from './state.service';
import {UtilityService} from './utility.service';


@Injectable({providedIn: 'root'})

export class InitializationService
{
	public readonly updateVaultSubject = new Subject<void>();
	public initialized = false;
	public appInitialized = false;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly apiService: ApiService,
		private readonly themeService: ThemeService,
		private readonly cryptoService: CryptoService,
		private readonly generatorService: GeneratorService,
		private readonly storageService: StorageService,
		private readonly messageService: MessageService,
		private readonly platformService: PlatformService,
		private readonly stateService: StateService,
		private readonly utilityService: UtilityService){}


	// Initializes the core.
	public async initialize(): Promise<void>
	{
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

		// Initialize the generator service.
		await this.generatorService.initialize();

		// Keep track of route changes.
		this.router.events.subscribe((event) =>
		{
			if(!(event instanceof NavigationStart) ||
				!event.url.startsWith('/app')) return;

			this.stateService.app.route = event.url;
		});

		// Check the version.
		const minimumVersion = await this.apiService.getMinimumVersion();

		if(this.utilityService.naturalCompare(Constants.version, minimumVersion) < 0)
			this.messageService.error(new Error('This version of Hyperpass '+
				'is out of date. Please update to continue.'), 0);

		this.initialized = true;
	}
}
