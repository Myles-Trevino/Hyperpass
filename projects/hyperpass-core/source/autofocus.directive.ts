/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {AfterViewInit} from '@angular/core';
import {Directive, ElementRef, Input} from '@angular/core';

import {StateService} from './services/state.service';
import {PlatformService} from './services/platform.service';


@Directive({selector: '[autofocus]'})

export class AutofocusDirective implements AfterViewInit
{
	@Input() public isModal = false;

	public constructor(private readonly element: ElementRef,
		private readonly stateService: StateService,
		private readonly platformService: PlatformService){}

	public ngAfterViewInit(): void
	{
		if(this.platformService.isMobile || (!this.isModal &&
			this.stateService.app.modalOpen)) return;

		(this.element.nativeElement as HTMLInputElement).focus();
	}
}
