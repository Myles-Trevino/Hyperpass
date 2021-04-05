/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-who-is-behind-this-project',
	templateUrl: './who-is-behind-this-project.component.html',
	styleUrls: ['../../support.component.scss']
})

export class WhoIsBehindThisProjectComponent
{
	@HostBinding('class') protected readonly class = 'page';
}
