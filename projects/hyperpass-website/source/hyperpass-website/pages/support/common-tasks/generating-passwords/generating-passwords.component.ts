/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {ThemeService} from 'hyperpass-core';

import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-generating-passwords',
	templateUrl: './generating-passwords.component.html',
	styleUrls: ['../../support.component.scss']
})

export class GeneratingPasswordsComponent
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService){}
}
