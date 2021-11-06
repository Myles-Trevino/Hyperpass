/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, Input, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformServer} from '@angular/common';

import {Constants} from 'builds/hyperpass-common';

import {imageFadeAnimation} from '../animations';


@Component
({
	selector: 'hyperpass-image-loader',
	templateUrl: './image-loader.component.html',
	styleUrls: ['./image-loader.component.scss'],
	animations: [imageFadeAnimation]
})

export class ImageLoaderComponent implements OnInit
{
	@Input() public url = '';
	@Input() public aspect = 2/1;
	@Input() public verticalAspect = 2/1;

	public imageSource?: string;
	public loading = true;


	// Constructor.
	public constructor(private readonly elementRef: ElementRef,
		@Inject(PLATFORM_ID) private readonly platformId: Object){}


	// Initializer.
	public ngOnInit(): void
	{
		if(!this.url) throw new Error('No URL given.');
		if(isPlatformServer(this.platformId)) return;

		const intersectionObserver = new IntersectionObserver((entries) =>
		{
			entries.forEach(({isIntersecting}) =>
			{
				if(isIntersecting)
				{
					this.imageSource = `${Constants.staticUrl}/images/${this.url}.webp`;
					intersectionObserver.unobserve(this.elementRef.nativeElement);
				}
			});
		});

		intersectionObserver.observe(this.elementRef.nativeElement);
	}
}
