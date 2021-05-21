/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {AfterViewInit} from '@angular/core';
import {Directive, ElementRef} from '@angular/core';

import {PlatformService} from './services/platform.service';


@Directive
({
	selector: '[autofocus]'
})

export class AutofocusDirective implements AfterViewInit
{
	public constructor(private readonly element: ElementRef,
		private readonly platformService: PlatformService){}

	public ngAfterViewInit(): void
	{
		if(!this.platformService.isMobile)
			(this.element.nativeElement as HTMLInputElement).focus();
	}
}
