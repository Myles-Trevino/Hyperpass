/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import {HostBinding, Directive, ViewChild} from '@angular/core';
import type {Subscription} from 'rxjs';
import * as Ionic from '@ionic/angular';
import type {NgScrollbar} from 'ngx-scrollbar';

import * as Types from '../../../types';
import {StateService} from '../../../services/state.service';
import {PlatformService} from '../../../services/platform.service';
import {MessageService} from '../../../services/message.service';
import {UtilityService} from '../../../services/utility.service';


@Directive()
export abstract class HistoryModalBaseDirective<T>
implements OnInit, OnDestroy, AfterViewInit
{
	@HostBinding('class') public readonly class = 'app-modal';
	@ViewChild('scrollbar') private readonly scrollbar?: NgScrollbar;

	public history: T[] = [];
	public hasHistory = false;
	private backButtonSubscription?: Subscription;
	private scrollbarSubscription?: Subscription;
	private readonly scrollState: Types.ScrollState;


	// Constructor.
	public constructor(public readonly platformService: PlatformService,
		protected readonly stateService: StateService,
		protected readonly messageService: MessageService,
		protected readonly ionicPlatform: Ionic.Platform,
		protected readonly utilityService: UtilityService,
		history: T[], scrollState: Types.ScrollState)
	{
		this.history = history;
		this.scrollState = scrollState;
		this.updateHasHistory();
	}


	// Initializer.
	public ngOnInit(): void
	{
		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(101, () => { this.close(); });
	}


	// Initializes the scrollbar.
	public async ngAfterViewInit(): Promise<void>
	{
		this.scrollbarSubscription = await this.stateService.initializeScrollbar(
			this.scrollState, this.scrollbar);
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.backButtonSubscription?.unsubscribe();
		this.scrollbarSubscription?.unsubscribe();
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
		try
		{
			this.updateHasHistory();
			this.updateCallback();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}

	// Update whether there are history entries.
	private updateHasHistory(): void { this.hasHistory = this.history.length > 0; }
}
