/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';

import {ApiService} from './api.service';
import {CryptoService} from './crypto.service';
import {AccountService} from './account.service';
import {MessageService} from './message.service';


@Injectable({providedIn: 'root'})

export class GeneratorService
{
	private words: string[] = [];


	// Constructor.
	public constructor(private readonly apiService: ApiService,
		private readonly messageService: MessageService,
		private readonly cryptoService: CryptoService,
		private readonly accountService: AccountService){}


	// Initializer.
	public async initialize(): Promise<void>
	{
		// Load the word list.
		this.words = await this.apiService.getWords();
	}


	// Generates a password.
	public generatePassword(length: number, useNumbers: boolean,
		useCapitals: boolean, useSpecialCharacters: boolean): string
	{
		// Validate.
		if(length < 1) throw Error('Length must be at least 1.');

		// Generate.
		const specialCharacters =
			['~', '!', '@', '#', '$', '%', '^', '&', '*', '-', '+', '<', '>', '?'];

		let password = '';
		for(let index = 0; index < length; ++index)
		{
			// Add a character or number to the password.
			const generateCharacter = useNumbers ? this.cryptoService.randomInt(0, 100) < 75 : true;

			if(generateCharacter)
			{
				let character = '';
				const characterNumber = this.cryptoService.randomInt(97,
					useSpecialCharacters ? 122+specialCharacters.length : 122);

				// Generate a random character.
				if(characterNumber <= 122)
				{
					character = String.fromCharCode(characterNumber);

					// Randomly capitalize if desired.
					if(useCapitals && this.cryptoService.randomInt(0, 1) === 0)
						character = character.toUpperCase();
				}

				// Generate a random special character.
				else character = specialCharacters[characterNumber-123];

				// Add the character to the password.
				password += character;
			}

			else
			{
				// Add a number to the password.
				const n = this.cryptoService.randomInt(0, 9);
				password += n;
			}
		}

		return password;
	}


	// Generates a passphrase.
	public generatePassphrase(wordCount: number, numberCount: number,
		separator: string, capitalize: boolean): string
	{
		// Validate.
		if(wordCount < 1) throw Error('The word count must be at least 1.');
		if(numberCount < 0) throw Error('The number count cannot be less than 0.');

		if(numberCount > wordCount)
			throw Error('The number count cannot be greater than the word count.');

		// Generate the random number positions.
		let result = '';
		const maximumNumberPosition = (wordCount*2)-1;
		const numberPositions: number[] = [];

		while(numberPositions.length < numberCount)
		{
			// Generate a number position.
			const newNumberPosition =
				this.cryptoService.randomInt(0, maximumNumberPosition);

			// Determine if the number position is unique.
			let unique = true;
			for(const position of numberPositions)
				if(newNumberPosition === position)
				{
					unique = false;
					break;
				}

			// Add the position to the queue if it is unique.
			if(unique) numberPositions.push(newNumberPosition);
		}

		// Generate the password.
		let numberIndex = 0;

		for(let index = 0; index < wordCount; ++index)
		{
			// Add the separator if appropriate.
			if(index !== 0)
			{
				result += separator;
				++numberIndex;
			}

			// Add a random number if appropriate.
			result = this.addRandomNumber(result, numberIndex, numberPositions);

			// Add a random word.
			const randomWord =
				this.words[this.cryptoService.randomInt(0, this.words.length-1)];

			if(!capitalize) result += randomWord;
			else result += randomWord.charAt(0).toUpperCase()+randomWord.slice(1);

			++numberIndex;

			// Add a random number if appropriate.
			result = this.addRandomNumber(result, numberIndex, numberPositions);
		}

		// Set the master password.
		return result;
	}


	// Generates using the last selected settings.
	public generate(): string
	{
		// Load the state.
		const state = this.accountService.getVault().generatorState;

		// Generate.
		if(state.mode === 'Passphrase') return this.generatePassphrase(
			state.wordCount, state.numberCount, state.separator, state.capitalize);

		return this.generatePassword(state.length, state.useNumbers,
			state.useCapitals, state.useSpecialCharacters);
	}


	// Helper function for generatePassphrase().
	private addRandomNumber(password: string, numberIndex: number,
		numberPositions: number[], maximumNumber = 99): string
	{
		for(const numberPosition of numberPositions)
		{
			if(numberPosition === numberIndex)
				password += this.cryptoService.randomInt(0, maximumNumber);
		}

		return password;
	}
}
