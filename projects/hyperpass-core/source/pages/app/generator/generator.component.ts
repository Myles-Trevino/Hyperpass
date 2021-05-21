/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../../../types';
import {GeneratorService} from '../../../services/generator.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';
import {AccountService} from '../../../services/account.service';
import {PlatformService} from '../../../services/platform.service';


@Component
({
	selector: 'hyperpass-generator',
	templateUrl: './generator.component.html',
	styleUrls: ['./generator.component.scss']
})

export class GeneratorComponent implements OnInit, OnDestroy
{
	public readonly types = Types;
	public state: Types.GeneratorState = Types.defaultGeneratorState;
	public password = '';

	private updateSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly platformService: PlatformService,
		private readonly generatorService: GeneratorService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Generate the initial password and set the initial state.
		this.generate(true);
		this.updateState();

		// Update the generator state on vault updates.
		this.updateSubscription = this.utilityService.updateVaultSubject.subscribe(
			() => { this.updateState(); });
	}


	// Destructor.
	public ngOnDestroy(): void { this.updateSubscription?.unsubscribe(); }


	// Updates the state.
	private updateState(): void
	{
		this.state = _.cloneDeep(this.accountService.getVault().generatorState);
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
					Number(this.state.wordCount), 1, 9, 'The number of words '+
					'must be between 1 and 9.');

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

			// Push the vault.
			this.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Clears the generator's history and pushes the vault.
	public async clearHistory(): Promise<void>
	{
		await this.accountService.pullVault();
		this.state.history = [];
		this.pushVault();
	}


	// Deletes the history entry at the given index.
	public async deleteHistoryEntry(index: number): Promise<void>
	{
		await this.accountService.pullVault();
		this.state.history.splice(index, 1);
		this.pushVault();
	}


	// Updates and pushes the vault.
	private pushVault(): void
	{
		this.accountService.getVault().generatorState = this.state;
		this.accountService.pushVault();
	}
}
