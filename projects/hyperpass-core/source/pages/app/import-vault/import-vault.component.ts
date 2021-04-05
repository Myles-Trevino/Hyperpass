/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {ElementRef, Component, HostBinding, ViewChild} from '@angular/core';
import * as PapaParse from 'papaparse';
import {Router} from '@angular/router';
import * as _ from 'lodash';

import * as Types from '../../../types';
import * as Settings from '../../../settings';
import {MessageService} from '../../../services/message.service';
import {AccountService} from '../../../services/account.service';
import {CryptoService} from '../../../services/crypto.service';
import {UtilityService} from '../../../services/utility.service';


@Component
({
	selector: 'hyperpass-import-vault',
	templateUrl: './import-vault.component.html'
})

export class ImportVaultComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('fileInput') private readonly fileInput?: ElementRef<HTMLInputElement>;

	public readonly types = Types;
	public format: Types.ImportFormat = 'HY Encrypted';
	public trim: Types.TrimMode = 'Enabled';
	public mode: Types.ImportMode = 'Merge';
	public masterPassword = '';

	private vault = Types.defaultVault;


	// Constructor.
	public constructor(private readonly messageService: MessageService,
		private readonly accountService: AccountService,
		private readonly cryptoService: CryptoService,
		private readonly utilityService: UtilityService,
		private readonly router: Router){}


	// Initializer.
	public ngOnInit(): void { this.vault = this.accountService.getVault(); }


	// Validates inputs and launches the file selection dialog.
	public loadFile(): void
	{
		try
		{
			// Validate the inputs.
			if(this.format === 'HY Encrypted' && !this.masterPassword)
				throw new Error('Please enter a master password.');

			// Open the file selection dialog.
			if(!this.fileInput) throw new Error('No file input was found.');
			this.fileInput.nativeElement.value = '';
			this.fileInput.nativeElement.click();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Imports the selected file.
	public async import(files: FileList | null): Promise<void>
	{
		try
		{
			// Get the selected file.
			if(files?.length === undefined) throw new Error('No file was selected.');
			const fileText = await files[0].text();

			// Import.
			switch(this.format)
			{
				case 'HY Encrypted': await this.importEncrypted(fileText); break;
				case 'HY Unencrypted': this.importUnencrypted(fileText); break;
				case 'Google': this.csvImport(fileText, 4, 0, 1, 2, 3); break;
				case 'Firefox': this.csvImport(fileText, 9, 0, 0, 1, 2); break;
				case 'Bitwarden': this.csvImport(fileText,
					10, 3, 6, 7, 8, 4, 2, 'login'); break;
				case 'LastPass': this.csvImport(fileText, 8, 5, 0, 1, 2, 4); break;
				default: throw new Error('Invalid import format.');
			}

			// Print a success message and push the vault.
			this.messageService.message(`Successfully imported the vault.`);
			this.utilityService.updateVaultSubject.next();
			this.accountService.pushVault();

			// If a vault entry is open for editing, close it.
			this.router.navigate(['/app', {outlets: {'vault': null}}]);
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Sets the tags if in overwrite mode.
	private setTags(tags: Record<string, Types.Tag>): void
	{
		if(this.mode === 'Overwrite') this.vault.tags = tags;
	}


	// Merges the two given accounts.
	private mergeAccounts(a: Types.Account, b: Types.Account): Types.Account
	{
		const result = _.cloneDeep(b);
		result.default = a.default;
		result.tags = a.tags;

		result.usernameHistory = this.utilityService
			.addToVaultEntryHistory(a.usernameHistory, b.username);

		result.passwordHistory = this.utilityService
			.addToVaultEntryHistory(a.passwordHistory, b.password);

		result.noteHistory = this.utilityService
			.addToVaultEntryHistory(a.noteHistory, b.note);

		return result;
	}


	// Appends the given accounts to the existing vault.
	private appendAccounts(accounts: Record<string, Types.Account>): void
	{
		try
		{
			// Trim.
			if(this.trim === 'Enabled')
				for(const account of Object.values(accounts))
					account.url = this.utilityService.trimUrl(account.url);

			// Import.
			this.vault.accounts = (this.mode === 'Overwrite') ? accounts :
				this.utilityService.uniqueAppend(accounts, this.vault.accounts,
					Types.areAccountsEqual, (this.mode === 'Merge'),
					(a, b) => this.mergeAccounts(a, b));

			// Set URL defaults.
			for(const account of Object.values(this.vault.accounts))
			{
				if(account.default) continue;

				// Check if there is another account that is
				// already the default for this account's URL.
				let defaultExists = false;
				for(const entry of Object.values(this.vault.accounts))
					if(account.url === entry.url && entry.default)
					{
						defaultExists = true;
						break;
					}

				// If there is no current default, make this account the default for its URL.
				if(!defaultExists) account.default = true;
			}
		}

		// Handle errors.
		catch(error: unknown)
		{
			throw new Error('Could not import the file. Please '+
				'make sure you have selected the correct format.');
		}
	}


	// Imports an encrypted vault.
	private async importEncrypted(fileText: string): Promise<void>
	{
		// Get the vault from the file.
		let importedVault: Types.Vault = Types.defaultVault;

		try
		{
			// Parse the file.
			const encryptedVault = JSON.parse(fileText) as Types.EncryptedData;

			// Derive the vault key.
			const importedVaultKey =
				await this.cryptoService.deriveKey(this.masterPassword, encryptedVault);

			// Decrypt and decompress the vault.
			importedVault = JSON.parse(this.cryptoService.decryptAndDecompress(
				encryptedVault, importedVaultKey)) as Types.Vault;
		}

		catch(error: unknown){ throw new Error('Invalid file or master password.'); }

		// Append.
		this.setTags(importedVault.tags);
		this.appendAccounts(importedVault.accounts);
	}


	// Imports an unencrypted vault.
	private importUnencrypted(fileText: string): void
	{
		// Parse the file.
		let importedVault = Types.defaultVault;
		try{ importedVault = JSON.parse(fileText) as Types.Vault; }
		catch(error: unknown){ throw new Error('Invalid file.'); }

		// Append.
		this.setTags(importedVault.tags);
		this.appendAccounts(importedVault.accounts);
	}


	// Imports from a CSV file.
	private csvImport(fileText: string, columns: number, nameIndex: number,
		urlIndex: number, usernameIndex: number, passwordIndex: number,
		noteIndex?: number, typeIndex?: number, type?: string): void
	{
		const parse = PapaParse.parse<string[]>(fileText, {skipEmptyLines: true});

		if(parse.errors.length !== 0)
			throw new Error(`Invalid file. Errors: ${parse.errors.toString()}`);

		// For each row in the CSV...
		const importedAccounts: Record<string, Types.Account> = {};
		for(const row of parse.data.slice(1))
		{
			// Check the column count.
			if(row.length !== columns)
				throw new Error(`Invalid column count of ${row.length}.`);

			// Check the type.
			if(typeIndex !== undefined && row[typeIndex] !== type) continue;

			// Parse the account.
			const account = Types.defaultAccount;
			account.url = row[urlIndex];
			account.username = row[usernameIndex];
			account.password = row[passwordIndex];

			if(noteIndex !== undefined) account.note = row[noteIndex];

			// Add the account to the record.
			if(!account.username && !account.password) continue;

			this.utilityService.uniqueAppend(
				{[row[nameIndex]]: _.cloneDeep(account)}, importedAccounts);
		}

		// Append the imported accounts to the vault.
		this.appendAccounts(importedAccounts);
	}
}
