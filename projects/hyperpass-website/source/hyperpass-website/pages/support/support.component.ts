/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-support',
	templateUrl: './support.component.html',
	styleUrls: ['./support.component.scss']
})

export class SupportComponent
{
	@HostBinding('class') protected readonly class = 'page';
}
