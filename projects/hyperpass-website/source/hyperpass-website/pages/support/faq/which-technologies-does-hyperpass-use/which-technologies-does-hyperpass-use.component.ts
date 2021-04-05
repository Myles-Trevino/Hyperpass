/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-which-technologies-does-hyperpass-use',
	templateUrl: './which-technologies-does-hyperpass-use.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhichTechnologiesDoesHyperpassUseComponent
{
	@HostBinding('class') protected readonly class = 'page';
}
