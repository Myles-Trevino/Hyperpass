/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {HostBinding, Directive} from '@angular/core';
import type {Subject, Subscription} from 'rxjs';

import {ModalService} from '../../../services/modal.service';
import {MessageService} from '../../../services/message.service';


@Directive()
export abstract class HistoryModalBaseDirective<T>
{
	@HostBinding('class') public readonly class = 'app-modal';

	public history: T[] = [];
	public hasHistory = false;

	private subject?: Subject<T[]>;
	private subscription?: Subscription;


	// Constructor.
	public constructor(protected readonly modalService: ModalService,
		protected readonly messageService: MessageService){}


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
	public close(): void { this.modalService.close(); }


	// Virtuals.
	protected updateCallback(): void { /* Virtual. */ }


	// Subscribes to the given history subject.
	protected subscribe(subject: Subject<T[]>): void
	{
		this.subject = subject;
		this.subscription = subject.subscribe((history) =>
		{
			this.subscription?.unsubscribe();
			this.history = history;
			this.update(true);
		});
	}


	// Unsubscribes from the given history subject.
	protected unsubscribe(): void { this.subscription?.unsubscribe(); }


	// Updates whether there are displayable history entries.
	private update(initial = false): void
	{
		this.hasHistory = this.history.length > 0;

		if(!initial)
		{
			this.updateCallback();
			this.subject?.next(this.history);
		}
	}
}
