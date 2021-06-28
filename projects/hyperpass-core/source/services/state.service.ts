/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import type {NgScrollbar} from 'ngx-scrollbar';
import {Router} from '@angular/router';
import type {Subscription} from 'rxjs';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

import * as Types from '../types';
import * as Settings from '../settings';
import {StorageService} from './storage.service';
import {CryptoService} from './crypto.service';


@Injectable({providedIn: 'root'})

export class StateService
{
	public vault: Types.VaultState = _.clone(Types.defaultVaultState);
	public generator: Types.GeneratorCachedState = _.clone(Types.defaultGeneratorCachedState);
	public options: Types.ScrollState = _.clone(Types.defaultScrollState);
	public app: Types.AppState = _.clone(Types.defaultAppState);

	public vaultEntry?: Types.VaultEntryState;

	public importVault: Types.ImportVaultState = _.clone(Types.defaultImportVaultState);
	public exportVault: Types.ExportVaultState = _.clone(Types.defaultExportVaultState);

	public tagsModal: Types.TagsModalState = _.clone(Types.defaultTagsModalState);
	public vaultHistoryModal: Types.VaultHistoryModalState = _.clone(Types.defaultVaultHistoryModalState);
	public vaultEntryHistoryModal: Types.VaultEntryHistoryModalState = _.clone(Types.defaultVaultEntryHistoryModalState);

	public tabSubject: Subject<void> = new Subject();
	public tagsModalSubject: Subject<Types.TagsModalEvent> = new Subject();
	public vaultHistoryModalSubject: Subject<void> = new Subject();
	public vaultEntryHistoryModalSubject: Subject<Types.VaultEntryHistoryEntry[]> = new Subject();

	public url = '';


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly cryptoService: CryptoService,
		private readonly storageService: StorageService){}


	// Loads cached state.
	public async load(masterPassword: string): Promise<void>
	{
		const cachedData = await this.storageService.getData(Settings.stateKey);
		if(!cachedData){ await this.router.navigate(['/app']); return; }
		const encryptedData = JSON.parse(cachedData) as Types.EncryptedData;

		const derivedKey =
			await this.cryptoService.deriveKey(masterPassword, encryptedData);

		const cachedState = JSON.parse(this.cryptoService.decryptAndDecompress(
			encryptedData, derivedKey)) as Types.CachedState;

		this.vault = cachedState.vault;
		this.generator = cachedState.generator;
		this.options = cachedState.options;
		this.app = cachedState.app;

		this.vaultEntry = cachedState.vaultEntry;

		this.importVault = cachedState.importVault;
		this.exportVault = cachedState.exportVault;

		this.tagsModal = cachedState.tagsModal;
		this.vaultHistoryModal = cachedState.vaultHistoryModal;
		this.vaultEntryHistoryModal = cachedState.vaultEntryHistoryModal;
	}


	// Caches state.
	public async save(key: Types.Key): Promise<void>
	{
		const data =
		({
			vault: this.vault,
			generator: this.generator,
			options: this.options,
			app: this.app,

			vaultEntry: this.vaultEntry,

			importVault: this.importVault,
			exportVault: this.exportVault,

			tagsModal: this.tagsModal,
			vaultHistoryModal: this.vaultHistoryModal,
			vaultEntryHistoryModal: this.vaultEntryHistoryModal
		});

		await this.storageService.setData(Settings.stateKey, JSON.stringify(
			this.cryptoService.compressAndEncrypt(JSON.stringify(data), key)));
	}


	// Opens the specified modal.
	public openModal(type: string): void
	{
		this.app.modalOpen = true;
		this.app.modalType = type;
	}


	// Closes any open modals.
	public closeModals(): void { this.app.modalOpen = false; }


	// Saves and restores the scrollbar's position.
	public async initializeScrollbar(state: Types.ScrollState,
		scrollbar?: NgScrollbar): Promise<Subscription | undefined>
	{
		if(!scrollbar) return;
		await new Promise((resolve) => { setTimeout(resolve); });

		// Restore the scroll position.
		await scrollbar.scrollTo({top: state.scrollPosition, duration: 0});

		// Save the scroll position.
		return scrollbar.scrolled.subscribe((event: Event) =>
		{
			const target = event.target as HTMLElement | null;
			if(target) state.scrollPosition = target.scrollTop;
		});
	}
}
