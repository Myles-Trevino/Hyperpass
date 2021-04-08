/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';

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

export class GeneratorComponent implements OnInit
{
	public readonly types = Types;
	public state: Types.GeneratorState = Types.defaultGeneratorState;
	public password = '';


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly platformService: PlatformService,
		private readonly generatorService: GeneratorService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Load the state.
		const vault = this.accountService.getVault();
		this.state = vault.generatorState;

		// Generate the initial password.
		this.generate();
	}


	// Sends a "copied" message.
	public sendCopiedMessage(): void { this.messageService.message('Copied.', 2); }


	// Generates a password.
	public generate(): void
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

			// Add the password to history.
			this.state.history.unshift({date: new Date(), password: this.password});

			// Limit the number of history entries.
			this.state.history.splice(10);

			// Push the vault.
			this.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Clears the generator's history and pushes the vault.
	public clearHistory(): void
	{
		this.state.history = [];
		this.pushVault();
	}


	// Deletes the history entry at the given index.
	public deleteHistoryEntry(index: number): void
	{
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
