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

import * as Types from '../../../types';
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
	@ViewChild('optionsScrollbar') private readonly optionsScrollbar?: NgScrollbar;
	@ViewChild('historyScrollbar') private readonly historyScrollbar?: NgScrollbar;

	public readonly types = Types;
	public password = '';
	public state: Types.GeneratorSyncedState = _.clone(Types.defaultGeneratorSyncedState);
	public cachedState: Types.GeneratorCachedState = _.clone(Types.defaultGeneratorCachedState);

	private updateSubscription?: Subscription;
	private optionsScrollbarSubscription?: Subscription;
	private historyScrollbarSubscription?: Subscription;


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
		this.updateState();

		// Update the generator state on vault updates.
		this.updateSubscription = this.utilityService.updateVaultSubject
			.subscribe(() => { this.updateState(); });
	}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.optionsScrollbarSubscription = await this.stateService.initializeScrollbar(
			this.cachedState.optionsScrollState, this.optionsScrollbar);

		this.historyScrollbarSubscription = await this.stateService.initializeScrollbar(
			this.cachedState.historyScrollState, this.historyScrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.updateSubscription?.unsubscribe();
		this.optionsScrollbarSubscription?.unsubscribe();
		this.historyScrollbarSubscription?.unsubscribe();
	}


	// Sends a "copied" message.
	public sendCopiedMessage(): void { this.messageService.message('Copied.', 2); }


	// Generates a password.
	public async generate(initial = false): Promise<void>
	{
		try
		{
			// Passphrase.
			if(this.state.mode === 'Passphrase')
			{
				// Validate the parameters.
				const parsedWordCount = this.utilityService.isWithinRange(
					Number(this.state.wordCount), 1, 9, 'The number '+
						'of words must be between 1 and 9.');

				const parsedNumberCount = this.utilityService.isWithinRange(
					Number(this.state.numberCount), 0, parsedWordCount, `The amount `+
					`of numbers must be between 0 and ${parsedWordCount}.`);

				if(this.state.separator.length !== 1)
					throw new Error('The separator must be a single character.');

				// Generate the password.
				this.password = this.generatorService.generatePassphrase(parsedWordCount,
					parsedNumberCount, this.state.separator, this.state.capitalize);
			}

			// Password.
			else
			{
				// Validate the parameters.
				const parsedLength = this.utilityService.isWithinRange(
					Number(this.state.length), 4, 64, 'The length must be between 4 and 64.');

				// Generate the password.
				this.password = this.generatorService.generatePassword(
					parsedLength, this.state.useNumbers, this.state.useCapitals,
					this.state.useSpecialCharacters);
			}

			// Pull the vault.
			if(!initial) await this.accountService.pullVault();

			// Add the password to history.
			this.state.history.unshift({date: new Date(), password: this.password});
			this.state.history.splice(10);

			// Scroll to the top.
			if(this.historyScrollbar)
				this.historyScrollbar.nativeElement.scrollTo({top: 0, behavior: 'smooth'});

			// Push the vault.
			this.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Clears the generator's history and pushes the vault.
	public async clearHistory(): Promise<void>
	{
		try
		{
			await this.accountService.pullVault();
			this.state.history = [];
			this.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Deletes the history entry at the given index.
	public async deleteHistoryEntry(index: number): Promise<void>
	{
		try
		{
			await this.accountService.pullVault();
			this.state.history.splice(index, 1);
			this.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Updates the state.
	private updateState(): void
	{
		// Update the state.
		this.state = _.cloneDeep(this.accountService.getVault().generatorState);

		// If there is no password history, generate a password.
		if(!this.state.history.length) this.generate();

		// Otherwise, display the last generated password.
		else this.password = this.state.history[0].password;
	}


	// Updates and pushes the vault.
	private async pushVault(): Promise<void>
	{
		this.accountService.getVault().generatorState = this.state;
		await this.accountService.pushVault();
	}
}
