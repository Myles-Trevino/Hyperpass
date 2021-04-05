/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-why-use-hyperpass-over-the-alternatives',
	templateUrl: './why-use-hyperpass-over-the-alternatives.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhyUseHyperpassOverTheAlternativesComponent
{
	@HostBinding('class') protected readonly class = 'page';
}
