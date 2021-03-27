/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';
import {formatDate} from '@angular/common';
import * as FileSaver from 'file-saver';

import * as Types from '../../../types';
import {MessageService} from '../../../services/message.service';
import {AccountService} from '../../../services/account.service';


@Component
({
	selector: 'hyperpass-export-vault',
	templateUrl: './export-vault.component.html'
})

export class ExportVaultComponent
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public readonly types = Types;
	public format: Types.ExportFormat = 'HY Encrypted';


	// Constructor.
	public constructor(private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Exports the vault in the selected format.
	public export(): void
	{
		try
		{
			// Export.
			switch(this.format)
			{
				case 'HY Encrypted': this.exportEncrypted(); break;
				case 'HY Unencrypted': this.exportUnencrypted(); break;
				default: throw new Error('Invalid export format.');
			}
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Saves the given data as a file with the given extension.
	private save(data: string, extension: string): void
	{
		const blob = new Blob([data]);

		FileSaver.saveAs(blob, `Vault Export ${formatDate(
			new Date(), 'y-M-d H-mm-ss', 'en')}.${extension}`);
	}


	// Exports the encrypted vault.
	private exportEncrypted(): void
	{ this.save(JSON.stringify(this.accountService.getEncryptedVault()), 'hy'); }


	// Exports the unencrypted vault.
	private exportUnencrypted(): void
	{
		const vault = this.accountService.getVault();
		this.save(JSON.stringify(vault.accounts), 'json');
	}
}
