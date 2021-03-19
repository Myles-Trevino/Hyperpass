/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})

export class IndexComponent
{ @HostBinding('class') protected readonly class = 'page'; }
