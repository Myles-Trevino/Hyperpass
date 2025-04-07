/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {ElementRef, Component, HostBinding, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';
import type {Subscription} from 'rxjs';
import {NgScrollbar} from 'ngx-scrollbar';
import * as PapaParse from 'papaparse';
import * as _ from 'lodash';

import {Types, Utilities} from 'builds/hyperpass-common';

import {MessageService} from '../../../services/message.service';
import {AccountService} from '../../../services/account.service';
import {CryptoService} from '../../../services/crypto.service';
import {UtilityService} from '../../../services/utility.service';
import {StateService} from '../../../services/state.service';
import {DropdownComponent} from '../../../dropdown/dropdown.component';
import {MasterPasswordInputComponent} from '../../../master-password-input/master-password-input.component';


@Component
({
	selector: 'hyperpass-import-vault',
	templateUrl: './import-vault.component.html',
	imports: [NgScrollbar, DropdownComponent, NgIf, MasterPasswordInputComponent]
})

export class ImportVaultComponent implements OnInit, AfterViewInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'app-page tile-section';
	@ViewChild('fileInput') private readonly fileInput?: ElementRef<HTMLInputElement>;
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;

	public readonly types = Types;
	public state: Types.ImportVaultState = _.clone(Types.defaultImportVaultState);
	public masterPassword = '';

	private vault = _.clone(Types.defaultVault);
	private scrollbarSubscription?: Subscription;


	// Constructor.
	public constructor(public readonly utilityService: UtilityService,
		public readonly stateService: StateService,
		private readonly messageService: MessageService,
		private readonly accountService: AccountService,
		private readonly cryptoService: CryptoService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.state = this.stateService.importVault;
		this.vault = this.accountService.getVault();
	}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.scrollbarSubscription = await this.stateService
			.initializeScrollbar(this.state, this.scrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.scrollbarSubscription?.unsubscribe();
	}


	// Validates inputs and launches the file selection dialog.
	public loadFile(): void
	{
		try
		{
			// Validate the inputs.
			if(this.state.format === 'HY Encrypted' && !this.masterPassword)
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
			switch(this.state.format)
			{
				case 'HY Encrypted': await this.importEncrypted(fileText); break;
				case 'HY Unencrypted': this.importUnencrypted(fileText); break;
				case 'Google CSV': this.csvImport(fileText, 4, 0, 1, 2, 3); break;
				case 'Firefox CSV': this.csvImport(fileText, 9, 0, 0, 1, 2); break;
				case 'Bitwarden CSV': this.csvImport(fileText,
					11, 3, 7, 8, 9, 4, 2, 'login'); break;
				case 'LastPass CSV': this.csvImport(fileText, 8, 5, 0, 1, 2, 4); break;
				default: throw new Error('Invalid import format.');
			}

			// If a vault entry is open for editing, close it.
			this.utilityService.close('vault');

			// Reset the vault state.
			this.stateService.vault = Types.defaultVaultState;

			// Print a success message and push the vault.
			this.messageService.message(`Successfully imported the vault.`);
			await this.accountService.pushVault();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Goes back to the options page.
	public back(): void
	{
		this.stateService.importVault = _.clone(Types.defaultImportVaultState);
		this.utilityService.close('options');
	}


	// Sets the tags if in overwrite mode.
	private setTags(tags: Record<string, Types.Tag>): void
	{
		if(this.state.mode === 'Overwrite') this.vault.tags = tags;
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
			if(this.state.trim === 'Enabled')
				for(const account of Object.values(accounts))
					account.url = Utilities.trimUrl(account.url);

			// Import.
			this.vault.accounts = (this.state.mode === 'Overwrite') ? accounts :
				Utilities.uniqueAppend(accounts, this.vault.accounts,
					Types.areAccountsEqual, (this.state.mode === 'Merge'),
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
		let importedVault: Types.Vault = _.clone(Types.defaultVault);

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
		let importedVault = _.clone(Types.defaultVault);
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
			throw new Error(`Invalid file.`);

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
			const account = _.clone(Types.defaultAccount);
			account.url = row[urlIndex];
			account.username = row[usernameIndex];
			account.password = row[passwordIndex];

			if(noteIndex !== undefined) account.note = row[noteIndex];

			// Add the account to the record.
			if(!account.username && !account.password) continue;

			Utilities.uniqueAppend(
				{[row[nameIndex]]: _.cloneDeep(account)}, importedAccounts);
		}

		// Append the imported accounts to the vault.
		this.appendAccounts(importedAccounts);
	}
}
