/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import browser from 'webextension-polyfill';
import {Router} from '@angular/router';

import {AccountService, InitializationService,
	PlatformService, StateService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-extension-root',
	templateUrl: './hyperpass-extension.component.html',
	styleUrls: ['./hyperpass-extension.component.scss']
})

export class HyperpassExtensionComponent implements OnInit
{
	// Constructor.
	public constructor(
		public readonly initializationService: InitializationService,
		public readonly platformService: PlatformService,
		private readonly router: Router,
		private readonly accountService: AccountService,
		private readonly stateService: StateService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.initializationService.initialize();
		this.platformService.isExtension = true;

		// Send login and logout messages.
		this.accountService.loginSubject.subscribe((loggedIn) =>
		{
			browser.runtime.sendMessage({type: 'loginUpdate', data: loggedIn});
			if(loggedIn) this.sendVaultUpdate();
		});

		// Send vault update messages.
		this.accountService.vaultUpdateSubject.subscribe(() => { this.sendVaultUpdate(); });

		// Send login timeout reset messages.
		this.accountService.resetLoginTimeoutSubject.subscribe((loginTimeoutDuration) =>
		{
			browser.runtime.sendMessage({type: 'loginTimeoutReset',
				data: loginTimeoutDuration});
		});

		// Get the current tab URL.
		const tabs = await browser.tabs.query({active: true, currentWindow: true});
		const url = tabs[0].url;
		if(url) this.stateService.url = url;

		// Save the state when the extension popup is closed.
		window.addEventListener('unload', () =>
		{
			if(this.accountService.vaultKey)
				this.stateService.save(this.accountService.vaultKey);
		});

		// Navigate to the app.
		this.router.navigate(['/app']);
	}


	// Sends a vault update.
	private sendVaultUpdate(): void
	{
		browser.runtime.sendMessage({type: 'vaultUpdate',
			data: this.accountService.getVault().accounts});
	}
}
