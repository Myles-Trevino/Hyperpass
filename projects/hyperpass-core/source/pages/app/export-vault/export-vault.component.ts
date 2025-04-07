/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {formatDate, NgIf} from '@angular/common';
import * as FileSaver from 'file-saver';
import * as _ from 'lodash';
import {NgScrollbar} from 'ngx-scrollbar';

import {Types} from 'builds/hyperpass-common';

import {MessageService} from '../../../services/message.service';
import {AccountService} from '../../../services/account.service';
import {UtilityService} from '../../../services/utility.service';
import {StateService} from '../../../services/state.service';
import {DropdownComponent} from '../../../dropdown/dropdown.component';


@Component
({
	selector: 'hyperpass-export-vault',
	templateUrl: './export-vault.component.html',
	imports: [NgScrollbar, DropdownComponent, NgIf]
})

export class ExportVaultComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public readonly types = Types;
	public state: Types.ExportVaultState = _.clone(Types.defaultExportVaultState);


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly stateService: StateService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService){}


	// Initializer.
	public ngOnInit(): void { this.state = this.stateService.exportVault; }


	// Exports the vault in the selected format.
	public export(): void
	{
		try
		{
			// Export.
			switch(this.state.format)
			{
				case 'HY Encrypted': this.exportEncrypted(); break;
				case 'HY Unencrypted': this.exportUnencrypted(); break;
				case 'Plaintext': this.exportPlaintext(); break;
				default: throw new Error('Invalid export format.');
			}
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Goes back to the options page.
	public back(): void
	{
		this.stateService.exportVault = _.clone(Types.defaultExportVaultState);
		this.utilityService.close('options');
	}


	// Saves the given data as a file with the given extension.
	private save(data: string, extension: string): void
	{
		const blob = new Blob([data]);

		FileSaver.saveAs(blob, `Hyperpass Export ${formatDate(
			new Date(), 'y-M-d h-mm-ss-a', 'en')}.${extension}`);
	}


	// Exports the encrypted vault.
	private exportEncrypted(): void
	{ this.save(JSON.stringify(this.accountService.getEncryptedVault()), 'hy'); }


	// Exports the unencrypted vault.
	private exportUnencrypted(): void
	{
		const vault = this.accountService.getVault();
		this.save(JSON.stringify(vault), 'json');
	}

	// Exports the unencrypted vault.
	private exportPlaintext(): void
	{
		const accounts = this.accountService.getVault().accounts;
		let data = 'Name | Username | Password | URL';

		for(const accountName in accounts)
		{
			const account = accounts[accountName];
			data += `${accountName} | ${account.username}`+
				` | ${account.password} | ${account.url}\n`;
		}

		this.save(data, 'txt');
	}
}
