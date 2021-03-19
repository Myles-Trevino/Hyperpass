/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, OnInit} from '@angular/core';
import {browser} from 'webextension-polyfill-ts';
import {Router} from '@angular/router';

import {AccountService, UtilityService} from 'hyperpass-core';
import {BackgroundService} from './background.service';


@Component
({
	selector: 'hyperpass-extension-root',
	templateUrl: './hyperpass-extension.component.html',
	styleUrls: ['./hyperpass-extension.component.scss']
})

export class HyperpassExtensionComponent implements OnInit
{
	// Constructor.
	public constructor(private readonly router: Router,
		private readonly utilityService: UtilityService,
		private readonly backgroundService: BackgroundService,
		private readonly accountService: AccountService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.utilityService.initialize();

		// If this is the background script, initialize the background service.
		if(window === await browser.runtime.getBackgroundPage())
			this.backgroundService.initialize();

		// If this is the popup...
		else
		{
			// Send login update messages.
			this.accountService.loginSubject.subscribe((loggedIn) =>
			{ browser.runtime.sendMessage({type: 'loginUpdate', data: loggedIn}); });

			// Send login timeout reset messages.
			this.accountService.resetLoginTimeoutSubject.subscribe((loginTimeoutDuration) =>
			{
				browser.runtime.sendMessage({message: 'loginTimeoutReset',
					loginTimeoutDuration});
			});

			// Send vault update messages.
			this.accountService.vaultUpdateSubject.subscribe(() =>
			{ browser.runtime.sendMessage({type: 'vaultUpdate', data: null}); });

			// Navigate to the app page.
			this.router.navigate(['/app']);
		}
	}
}
