/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, AfterViewInit} from '@angular/core';
import {Component, HostBinding, ViewChild} from '@angular/core';
import {SimplebarAngularComponent} from 'simplebar-angular';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Settings from '../../../settings';
import {AccountService} from '../../../services/account.service';
import {ThemeService} from '../../../services/theme.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {StateService} from '../../../services/state.service';


@Component
({
	selector: 'hyperpass-options',
	templateUrl: './options.component.html',
	styleUrls: ['./options.component.scss']
})

export class OptionsComponent implements OnInit, AfterViewInit
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('simpleBar') private readonly simpleBar?: SimplebarAngularComponent;

	public readonly types = Types;
	public settings: Types.Settings = Types.defaultSettings;


	// Constructor.
	public constructor(private readonly accountService: AccountService,
		private readonly themeService: ThemeService,
		private readonly utilityService: UtilityService,
		private readonly messageService: MessageService,
		private readonly stateService: StateService){}


	// Initializers.
	public ngOnInit(): void
	{
		// Load the settings.
		const vault = this.accountService.getVault();
		this.settings = _.cloneDeep(vault.settings);
	}

	public ngAfterViewInit(): void
	{
		// Initialize SimpleBar.
		this.stateService.initializeSimpleBar(this.stateService.options, this.simpleBar);
	}


	// Logs out.
	public logOut(): void { this.accountService.logOut(); }


	// Syncs the account.
	public async sync(): Promise<void>
	{
		await this.accountService.pullVault();
		this.utilityService.updateVaultSubject.next();
		this.messageService.message('Successfully synced.', 2);
	}


	// Sets the theme.
	public setTheme(theme: Types.Theme): void
	{
		this.settings.theme = theme;
		this.applySettings();
		this.themeService.setTheme(this.settings.theme);
	}


	// Sets the login timeout.
	public setLoginTimeout(loginTimeout: Types.LoginTimeout): void
	{
		this.settings.loginTimeout = loginTimeout;
		this.applySettings();
		this.accountService.startLoginTimeout();
	}


	// Launches the support page.
	public support(): void { window.open(`${Settings.websiteUrl}/support`, '_blank'); }


	// Applies the settings to the vault and pushes the vault.
	private applySettings(): void
	{
		this.accountService.getVault().settings = _.cloneDeep(this.settings);
		this.accountService.pushVault();
		this.accountService.updateLoginTimeoutDuration();
		this.accountService.resetLoginTimeout(true);
	}
}
