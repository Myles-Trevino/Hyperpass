/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';

import {AccountService} from '../../../services/account.service';
import {MessageService} from '../../../services/message.service';
import {GeneratorService} from '../../../services/generator.service';


@Component
({
	selector: 'hyperpass-master-password',
	templateUrl: './master-password.component.html'
})

export class MasterPasswordComponent
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public newMasterPassword = '';


	// Constructor.
	public constructor(private readonly accountService: AccountService,
		private readonly generatorService: GeneratorService,
		private readonly messageService: MessageService){}


	// Changes the master password.
	public async change(newMasterPasswordConfirmation: string): Promise<void>
	{
		try
		{
			// Validate the master password.
			this.accountService.validateMasterPassword(
				this.newMasterPassword, newMasterPasswordConfirmation);

			// Change the master password.
			await this.accountService.changeMasterPassword(this.newMasterPassword);

			// Send a success message and return to the settings page.
			this.messageService.message('Your master '+
				'password has been successfully changed.');
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Generates a master password.
	public generateMasterPassword(): void
	{ this.newMasterPassword = this.generatorService.generate(); }
}
