/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {AfterViewInit} from '@angular/core';
import {Directive, ElementRef, Input} from '@angular/core';

import {StateService} from './services/state.service';
import {PlatformService} from './services/platform.service';
import {UtilityService} from './services/utility.service';


@Directive({selector: '[autofocusDirective]'})

export class AutofocusDirective implements AfterViewInit
{
	@Input() public autofocusEnabled = true;
	@Input() public isModal = false;

	private tab?: string;

	public constructor(private readonly element: ElementRef,
		private readonly stateService: StateService,
		private readonly platformService: PlatformService,
		private readonly utilityService: UtilityService){}


	// Initializer.
	public ngAfterViewInit(): void
	{
		if(!this.autofocusEnabled || this.platformService.isMobile ||
			(!this.isModal && this.stateService.app.modalOpen)) return;

		// Get the tab.
		this.tab = this.stateService.app.tab;

		// Refocus on tab switch.
		this.stateService.tabSubject.subscribe(() => { this.focus(); });

		// Refocus on modal close.
		if(!this.isModal)
			this.stateService.modalCloseSubject.subscribe(() => { this.focus(); });

		this.focus(true);
	}


	// Focuses the element.
	private async focus(ignorePage = false): Promise<void>
	{
		if(!ignorePage && this.stateService.app.tab !== this.tab) return;
		await this.utilityService.sleep();
		(this.element.nativeElement as HTMLInputElement).focus({preventScroll: true});
	}
}
