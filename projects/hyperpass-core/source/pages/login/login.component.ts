/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding, HostListener} from '@angular/core';
import {Router} from '@angular/router';

import * as Settings from '../../settings';
import {AccountService} from '../../services/account.service';
import {MessageService} from '../../services/message.service';
import {StorageService} from '../../services/storage.service';
import {MetadataService} from '../../services/metadata.service';


@Component
({
	selector: 'hyperpass-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'centerer-page';

	public emailAddress = '';
	public masterPassword = '';


	// Keypress callback.
	@HostListener('document:keypress', ['$event'])
	public handleKeyboardEvent(event: KeyboardEvent): void
	{
		if(event.key === 'Enter') this.logIn();
	}


	// Constructor.
	public constructor(private readonly router: Router,
		public readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly storageService: StorageService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Login');
		this.metadataService.setDescription('Log in to start using the Hyperpass web app.');
		this.metadataService.setImage('login');

		// Load the cached email address if there is one.
		const cachedEmailAddress =
			await this.storageService.getData(Settings.emailAddressKey);

		if(cachedEmailAddress) this.emailAddress = cachedEmailAddress;
	}


	// Redirects to the signup page.
	public signUp(): void { this.router.navigate(['/signup']); }


	// Attempts to log the user in.
	public async logIn(): Promise<void>
	{
		try
		{
			// Attempt to log in.
			if(!this.emailAddress) throw new Error('Please enter your email address.');
			if(!this.masterPassword) throw new Error('Please enter your master password.');
			await this.accountService.logIn(this.emailAddress, this.masterPassword);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}
}
