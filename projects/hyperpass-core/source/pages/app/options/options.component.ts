/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {AfterViewInit, OnDestroy} from '@angular/core';
import {Component, HostBinding, ViewChild} from '@angular/core';
import type {Subscription} from 'rxjs';
import {NgScrollbar} from 'ngx-scrollbar';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Settings from '../../../constants';
import {AccountService} from '../../../services/account.service';
import {ThemeService} from '../../../services/theme.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {PlatformService} from '../../../services/platform.service';
import {StateService} from '../../../services/state.service';
import {StorageService} from '../../../services/storage.service';


@Component
({
	selector: 'hyperpass-options',
	templateUrl: './options.component.html',
	styleUrls: ['./options.component.scss']
})

export class OptionsComponent implements AfterViewInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;

	public readonly types = Types;
	public settings = Settings;
	private scrollbarSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		public readonly accountService: AccountService,
		public readonly themeService: ThemeService,
		public readonly stateService: StateService,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		private readonly storageService: StorageService){}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.scrollbarSubscription = await this.stateService
			.initializeScrollbar(this.stateService.options, this.scrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void { this.scrollbarSubscription?.unsubscribe(); }


	// Logs out.
	public logOut(): void
	{
		try
		{
			this.accountService.logOut();
			this.stateService.restoreDefaults();
		}
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Syncs the account.
	public async sync(): Promise<void>
	{
		try
		{
			await this.accountService.pullVault();
			this.utilityService.updateVaultSubject.next();
			this.messageService.message('Synced.', 2);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Logs out of all devices.
	public globalLogout(): void
	{
		try
		{
			this.accountService.globalLogout();
			this.stateService.restoreDefaults();
		}
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Sets the login timeout.
	public setLoginTimeout(loginTimeout: Types.LoginTimeout): void
	{
		try
		{
			this.storageService.setData(Settings.loginTimeoutKey, loginTimeout);
			this.accountService.updateLoginTimeoutDuration();
			this.accountService.resetLoginTimeout(true);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
