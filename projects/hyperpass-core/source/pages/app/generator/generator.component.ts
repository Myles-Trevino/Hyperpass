/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import {Component, ViewChild} from '@angular/core';
import type {Subscription} from 'rxjs';
import {NgScrollbar} from 'ngx-scrollbar';
import * as _ from 'lodash';

import {Types, Utilities} from 'builds/hyperpass-common';

import {GeneratorService} from '../../../services/generator.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {AccountService} from '../../../services/account.service';
import {PlatformService} from '../../../services/platform.service';
import {StateService} from '../../../services/state.service';


@Component
({
	selector: 'hyperpass-generator',
	templateUrl: './generator.component.html',
	styleUrls: ['./generator.component.scss']
})

export class GeneratorComponent implements OnInit, OnDestroy, AfterViewInit
{
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;

	public readonly types = Types;
	public password = '';
	public state: Types.GeneratorSyncedState = _.clone(Types.defaultGeneratorSyncedState);
	public cachedState: Types.ScrollState = _.clone(Types.defaultScrollState);
	public settingsChanged = false;
	public passwordOutdated = false;

	private updateSubscription?: Subscription;
	private scrollbarSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly platformService: PlatformService,
		public readonly stateService: StateService,
		private readonly generatorService: GeneratorService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Load the initial state.
		this.cachedState = this.stateService.generator;
		this.state = _.cloneDeep(this.accountService.getVault().generatorState);
		this.generate();

		// Update the generator state on vault updates.
		this.updateSubscription = this.stateService.updateVaultSubject.subscribe(() =>
		{
			this.state = _.cloneDeep(this.accountService.getVault().generatorState);
		});
	}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.scrollbarSubscription =
			await this.stateService.initializeScrollbar(this.cachedState, this.scrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.updateSubscription?.unsubscribe();
		this.scrollbarSubscription?.unsubscribe();
	}


	// Sends a "copied" message.
	public sendCopiedMessage(): void { this.messageService.message('Copied.', 2); }


	// Generates a password and saves the settings if they have been changed.
	public generate(): void
	{
		try
		{
			// Validate the parameters.
			if(this.state.mode === 'Passphrase')
			{
				const parsedWordCount = Utilities.isWithinRange(
					Number(this.state.wordCount), 1, 9, 'The number '+
						'of words must be between 1 and 9.');

				Utilities.isWithinRange(Number(this.state.numberCount),
					0, parsedWordCount, `The amount of numbers `+
					`must be between 0 and ${parsedWordCount}.`);

				if(this.state.separator.length !== 1)
					throw new Error('The separator must be a single character.');
			}

			else
			{
				Utilities.isWithinRange(
					Number(this.state.length), 4, 64, 'The length must be between 4 and 64.');
			}

			// Generate the password.
			this.password = this.generatorService.generate(this.state);
			this.passwordOutdated = false;
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Checks whether the settings have been changed.
	public settingsCallback(): void
	{
		this.settingsChanged = this.stateService.isOnline &&
			!_.isEqual(this.state, this.accountService.getVault().generatorState);

		if(this.settingsChanged) this.passwordOutdated = true;
	}


	// Saves the settings.
	public saveSettings(): void
	{
		this.accountService.getVault().generatorState = _.cloneDeep(this.state);
		this.accountService.pushVault();
		if(this.passwordOutdated) this.generate();
		this.settingsChanged = false;
	}


	// Resets the settings to the last ones saved.
	public restoreSettings(): void
	{
		this.state = _.cloneDeep(this.accountService.getVault().generatorState);
		if(!this.passwordOutdated) this.generate();
		this.settingsChanged = false;
	}
}
