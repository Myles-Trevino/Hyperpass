/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {HostBinding, Directive} from '@angular/core';

import {StateService} from '../../../services/state.service';
import {MessageService} from '../../../services/message.service';


@Directive()
export abstract class HistoryModalBaseDirective<T>
{
	@HostBinding('class') public readonly class = 'app-modal';

	public history: T[] = [];
	public hasHistory = false;


	// Constructor.
	public constructor(protected readonly stateService: StateService,
		protected readonly messageService: MessageService, history: T[])
	{
		this.history = history;
		this.updateHasHistory();
	}


	// Deletes the entry at the given index.
	public delete(index: number): void
	{
		this.history.splice(index, 1);
		this.update();
	}


	// Clears the history.
	public clear(): void
	{
		this.history = [];
		this.update();
	}


	// Exits the modal.
	public close(): void { this.stateService.closeModals(); }


	// Virtuals.
	protected updateCallback(): void { /* Virtual. */ }


	// Update.
	private update(): void
	{
		this.updateHasHistory();
		this.updateCallback();
	}

	// Update whether there are history entries.
	private updateHasHistory(): void { this.hasHistory = this.history.length > 0; }
}
