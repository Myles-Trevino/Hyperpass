/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {Router} from '@angular/router';

import * as Types from '../../../../types';
import {VaultEntryBaseDirective} from '../vault-entry-base.directive';
import {UtilityService} from '../../../../services/utility.service';
import {AccountService} from '../../../../services/account.service';
import {MessageService} from '../../../../services/message.service';
import {GeneratorService} from '../../../../services/generator.service';
import {ModalService} from '../../../../services/modal.service';


@Component
({
	selector: 'hyperpass-account',
	templateUrl: './account.component.html'
})

export class AccountComponent extends VaultEntryBaseDirective<Types.Account>
	implements OnInit, OnDestroy
{
	public showUrlWarning = false;


	// Constructor.
	public constructor(accountService: AccountService, router: Router,
		utilityService: UtilityService, messageService: MessageService,
		modalService: ModalService, private readonly generatorService: GeneratorService)
	{
		super(accountService, router, utilityService, messageService,
			modalService, Types.defaultAccount, 'Account');
	}


	// Initializer.
	public ngOnInit(): void
	{
		super.initialize();
		this.updateUrlWarning();
	}


	// Destructor.
	public ngOnDestroy(): void { super.destroy(); }


	// Generates a password.
	public generatePassword(): void
	{ this.state.password = this.generatorService.generate(); }


	// Opens the username history modal.
	public viewUsernameHistory(): void
	{
		this.viewHistory(this.state.usernameHistory, (history) =>
		{
			this.getSelf().usernameHistory = history;
			this.state.usernameHistory = history;
			this.accountService.pushVault();
		});
	}


	// Opens the password history modal.
	public viewPasswordHistory(): void
	{
		this.viewHistory(this.state.passwordHistory, (history) =>
		{
			this.getSelf().passwordHistory = history;
			this.state.passwordHistory = history;
			this.accountService.pushVault();
		});
	}


	// URL change callback.
	public urlChangeCallback(url: string): void
	{
		this.state.url = url;
		this.updateUrlWarning();
	}


	// Validates and sets default status.
	protected saveCallback(account: Types.Account): void
	{
		// Validate.
		if(!account.password) throw new Error('Please enter a password.');

		// If there is no default for this URL, make this account the default.
		for(const value of Object.values(this.getEntries()))
			if(value.url.includes(account.url)) return;

		account.default = true;
	}

	// Updates default status.
	protected deleteCallback(account: Types.Account): void
	{
		// If there is another account with this URL, make it the default.
		const entries = this.getEntries();

		for(const [key, value] of Object.entries(entries))
			if(value.url.includes(account.url)) entries[key].default = true;
	}


	// Returns the vault's account entries.
	protected getEntries(): Record<string, Types.Account>
	{ return this.accountService.getVault().accounts; }


	// Updates the account's username and password history.
	protected updateHistory(): void
	{
		this.addToHistory(this.state.username, this.state.usernameHistory);
		this.addToHistory(this.state.password, this.state.passwordHistory);
	}


	// Updates the URL warning.
	private updateUrlWarning(): void
	{
		const undesiredTokens = [':', '/', 'www.'];
		this.showUrlWarning = false;

		for(const token of undesiredTokens)
			if(this.state.url.includes(token)) this.showUrlWarning = true;
	}
}
