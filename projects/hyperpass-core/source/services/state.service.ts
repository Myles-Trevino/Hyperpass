/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import type * as SimpleBar from 'simplebar';
import type {SimplebarAngularComponent} from 'simplebar-angular';

import * as Types from '../types';
import * as Settings from '../settings';
import {UtilityService} from './utility.service';
import {StorageService} from './storage.service';


@Injectable({providedIn: 'root'})

export class StateService
{
	public vault: Types.VaultState = Types.defaultVaultState;
	public options: Types.ScrollState = Types.defaultScrollState;

	public tagsModal: Types.TagsModalState = Types.defaultTagsModalState;
	public vaultHistoryModal: Types.VaultHistoryModalState = Types.defaultVaultHistoryModalState;
	public vaultEntryHistoryModal: Types.VaultEntryHistoryModalState = Types.defaultVaultEntryHistoryModalState;

	public modalOpen = false;
	public modalType?: string;


	// Constructor.
	public constructor(private readonly utillityService: UtilityService,
		private readonly storageService: StorageService){}


	// Loads cached state.
	public async load(): Promise<void>
	{
		const rawCachedState = await this.storageService.getData(Settings.stateKey);
		if(!rawCachedState) return;

		const cachedState = JSON.parse(rawCachedState) as Types.CachedState;
		this.vault = cachedState.vault;
	}


	// Caches state.
	public async save(): Promise<void>
	{
		await this.storageService.setData(Settings.stateKey,
			JSON.stringify({vault: this.vault}));
	}


	// Opens the specified modal.
	public openModal(type: string): void
	{
		this.modalOpen = true;
		this.modalType = type;
	}


	// Closes any open modals.
	public closeModals(): void { this.modalOpen = false; }


	// Saves and restores SimpleBar's scroll position.
	public async initializeSimpleBar(state: Types.ScrollState,
		simpleBar?: SimplebarAngularComponent): Promise<void>
	{
		if(!simpleBar) return;
		const simpleBarElement = simpleBar.SimpleBar as SimpleBar;
		const scrollElement = simpleBarElement.getScrollElement();
		await this.utillityService.sleep(); // Wait for the element to initialize.

		// Restore the scroll position.
		scrollElement.scrollTop = state.scrollPosition;

		// Save the scroll position.
		scrollElement.addEventListener('scroll', () =>
		{
			state.scrollPosition = scrollElement.scrollTop;
		});
	}
}
