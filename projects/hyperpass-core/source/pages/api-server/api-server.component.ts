/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';
import type {Subscription} from 'rxjs';
import * as Ionic from '@ionic/angular';

import {Constants} from 'builds/hyperpass-common';

import {MessageService} from '../../services/message.service';
import {UtilityService} from '../../services/utility.service';
import {StorageService} from '../../services/storage.service';
import {PlatformService} from '../../services/platform.service';
import {InitializationService} from '../../services/initialization.service';


@Component
({
	selector: 'hyperpass-api-server',
	templateUrl: './api-server.component.html'
})

export class ApiServerComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'centerer-page';

	public apiServer = '';
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		private readonly ionicPlatform: Ionic.Platform,
		private readonly platformService: PlatformService,
		private readonly storageService: StorageService,
		private readonly initializationService: InitializationService,
		private readonly router: Router){}


	// Initializer.
	public ngOnInit(): void
	{
		this.apiServer = this.platformService.apiServer;

		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(100, () => { this.utilityService.close('options'); });
	}


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Returns to the app.
	public cancel(): void { this.router.navigate(['/app']); }


	// Changes the master password.
	public async change(reset = false): Promise<void>
	{
		try
		{
			// Make sure an address was entered.
			if(!reset && !this.apiServer) throw new Error('Please enter an API server.');

			// Set the new API server.
			if(reset) this.apiServer = Constants.defaultApiServer;
			this.platformService.apiServer = this.apiServer;

			// Save the API server.
			await this.storageService.setData(
				Constants.apiServerKey, this.platformService.apiServer);

			// Send a success message.
			this.messageService.message(`API server ${
				reset ? 'reset' : 'changed'} successfully.`);

			// Return to the app page.
			await this.initializationService.reinitialize();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
