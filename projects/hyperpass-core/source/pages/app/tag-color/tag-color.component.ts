/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnChanges} from '@angular/core';
import {Component, Input, HostBinding} from '@angular/core';


@Component
({
	selector: 'hyperpass-tag-color',
	template: '',
	styleUrls: ['./tag-color.component.scss']
})

export class TagColorComponent implements OnChanges
{
	@Input() public color = 'None';
	@HostBinding('style.backgroundColor') public backgroundColor = '';
	@HostBinding('style.boxShadow') public boxShadow = 'none';
	@HostBinding('style.display') public display = 'block';


	// On changes.
	public ngOnChanges(): void
	{
		const noColor = (this.color === 'None');

		this.boxShadow = noColor ? 'inset 0 0 0 var(--line-width) var(--text-color)' :
			`0 0 .3rem var(--${this.color.toLowerCase()}-glow-color)`;

		this.backgroundColor = noColor ? 'transparent' :
			`var(--${this.color.toLowerCase()}-color)`;
	}
}
