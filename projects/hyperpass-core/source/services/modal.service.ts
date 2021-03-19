/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import type * as Types from '../types';


@Injectable({providedIn: 'root'})

export class ModalService
{
	public readonly tagsSubject = new Subject<string>();
	public readonly vaultHistorySubject = new Subject<Types.VaultHistoryEntry[]>();
	public readonly inputHistorySubject = new Subject<Types.InputHistoryEntry[]>();

	public isOpen = false;
	public type?: string;


	// Opens the specified modal.
	public open(type: string): void
	{
		this.isOpen = true;
		this.type = type;
	}


	// Closes any open modals.
	public close(): void { this.isOpen = false; }
}
