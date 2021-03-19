/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import * as SimpleBar from 'simplebar';
import {SimplebarAngularComponent} from 'simplebar-angular';

import * as Types from '../types';
import {UtilityService} from './utility.service';


@Injectable({providedIn: 'root'})

export class StateService
{
	public vault: Types.VaultState = Types.defaultVaultState;
	public options: Types.ScrollState = Types.defaultScrollState;


	// Constructor.
	public constructor(private readonly utillityService: UtilityService){}


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
		scrollElement.addEventListener('scroll',
			() => { state.scrollPosition = scrollElement.scrollTop; });
	}
}
