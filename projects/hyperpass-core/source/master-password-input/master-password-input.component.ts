/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, Input, Output, EventEmitter, HostBinding} from '@angular/core';

import {GeneratorService} from '../services/generator.service';
import {PlatformService} from '../services/platform.service';


@Component
({
	selector: 'hyperpass-master-password-input',
	templateUrl: './master-password-input.component.html'
})

export class MasterPasswordInputComponent
{
	@HostBinding('class') public readonly class = 'app-button-input-container hoverable-container';

	@Input() public placeholder = '';
	@Input() public masterPassword = '';
	@Output() public readonly masterPasswordChange = new EventEmitter<string>();

	public show = false;


	// Constructor.
	public constructor(
		public readonly platformService: PlatformService,
		private readonly generatorService: GeneratorService){}


	// Generates a master password.
	public generate(): void
	{
		this.change(this.generatorService.generatePassphrase(3, 2, '-', true));
		this.show = true;
	}


	// Input change callback.
	public change(input: string): void
	{
		this.masterPassword = input;
		this.masterPasswordChange.emit(this.masterPassword);
	}


	// Toggles master password visibility.
	public toggle(): void { this.show = !this.show; }
}
