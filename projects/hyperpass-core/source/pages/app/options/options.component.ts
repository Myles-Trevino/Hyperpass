/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {Component, HostBinding, ViewChild} from '@angular/core';
import type {Subscription} from 'rxjs';
import {SimplebarAngularComponent} from 'simplebar-angular';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Settings from '../../../settings';
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

export class OptionsComponent implements OnInit, AfterViewInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('simpleBar') private readonly simpleBar?: SimplebarAngularComponent;

	public readonly types = Types;
	public settings = _.clone(Types.defaultSettings);
	public settings_ = Settings;
	private simpleBarSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		public readonly accountService: AccountService,
		private readonly utilityService: UtilityService,
		private readonly themeService: ThemeService,
		private readonly messageService: MessageService,
		private readonly storageService: StorageService,
		private readonly stateService: StateService){}


	// Initializers.
	public ngOnInit(): void
	{
		// Load the settings.
		const vault = this.accountService.getVault();
		this.settings = _.cloneDeep(vault.settings);
	}


	// Initializes SimpleBar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.simpleBarSubscription = await this.stateService
			.initializeSimpleBar(this.stateService.options, this.simpleBar);
	}


	// Destructor.
	public ngOnDestroy(): void { this.simpleBarSubscription?.unsubscribe(); }


	// Logs out.
	public logOut(): void { this.accountService.logOut(); }


	// Syncs the account.
	public async sync(): Promise<void>
	{
		await this.accountService.pullVault();
		this.utilityService.updateVaultSubject.next();
		this.messageService.message('Synced.', 2);
	}


	// Sets the theme.
	public setTheme(theme: Types.Theme): void
	{
		this.settings.theme = theme;
		this.applySettings();
		this.themeService.setTheme(this.settings.theme);
	}


	// Logs out of all devices.
	public globalLogout(): void { this.accountService.globalLogout(); }


	// Sets the login timeout.
	public setLoginTimeout(loginTimeout: Types.LoginTimeout): void
	{
		this.storageService.setData(Settings.loginTimeoutKey, loginTimeout);
		this.accountService.updateLoginTimeoutDuration();
		this.accountService.startLoginTimeout();
	}


	// Applies the settings to the vault and pushes the vault.
	private applySettings(): void
	{
		this.accountService.getVault().settings = _.cloneDeep(this.settings);
		this.accountService.pushVault();
		this.accountService.resetLoginTimeout(true);
	}
}
