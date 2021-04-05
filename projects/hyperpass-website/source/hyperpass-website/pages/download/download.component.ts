/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Settings} from 'hyperpass-core';

import {Component, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-download',
	templateUrl: './download.component.html',
	styleUrls: ['./download.component.scss']
})

export class DownloadComponent
{
	@HostBinding('class') protected readonly class = 'page';

	public readonly settings = Settings;
}
