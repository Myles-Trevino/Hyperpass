/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding} from '@angular/core';

import {ThemeService, MetadataService} from 'hyperpass-core';
import {ImageLoaderComponent} from '../../../image-loader/image-loader.component';


@Component
({
	selector: 'hyperpass-introduction',
	templateUrl: './introduction.component.html',
	styleUrls: ['../support.component.scss'],
	imports: [ImageLoaderComponent]
})

export class IntroductionComponent implements OnInit
{
	@HostBinding('class') protected readonly class = 'page';


	// Constructor.
	public constructor(public readonly themeService: ThemeService,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.metadataService.clear();
		this.metadataService.setTitle('Introduction - Support');
		this.metadataService.setDescription(
			'Learn about how to get started with Hyperpass.');
		this.metadataService.setImage('support');
	}
}
