/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

import {UtilityService} from '../../../services/utility.service';
import * as Types from '../../../types';


@Component
({
	selector: 'hyperpass-vault-entry',
	templateUrl: './vault-entry.component.html'
})

export class VaultEntryComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'app-page tile-section';

	public readonly types = Types;
	public readonly events = new Subject<string>();
	public type: Types.VaultEntryType = 'Account';
	public key?: string;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly utilityService: UtilityService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Load the type and key.
		const type = this.utilityService.loadUrlParameter('type');
		this.type = type as Types.VaultEntryType;

		this.key = this.utilityService.loadUrlParameter('key');
	}
}
