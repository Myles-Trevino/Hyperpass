/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';

import * as Constants from '../constants';


@Injectable({providedIn: 'root'})

export class MetadataService
{
	public constructor(private readonly titleService: Title,
		private readonly metaService: Meta){}


	// Clears the metadata.
	public clear(): void
	{
		this.metaService.removeTag('property=\'og:title\'');

		this.metaService.removeTag('name=\'description\'');
		this.metaService.removeTag('property=\'og:description\'');

		this.metaService.removeTag('property=\'og:image\'');
		this.metaService.removeTag('name=\'twitter:card\'');
	}


	// Sets the title.
	public setTitle(title?: string): void
	{
		title = title ? `${title} - Hyperpass` : 'Hyperpass';
		this.titleService.setTitle(title);
		this.metaService.addTag({property: 'og:title', content: title});
	}


	// Sets the description.
	public setDescription(description: string): void
	{
		this.metaService.addTags
		([
			{name: 'description', content: description},
			{property: 'og:description', content: description}
		]);
	}


	// Sets the image.
	public setImage(image = 'hyperpass'): void
	{
		const imageUrl = `${Constants.staticUrl}/images/metadata/${image}.jpg`;
		this.metaService.addTag({property: 'og:image', content: imageUrl});
		this.metaService.addTag({name: 'twitter:card', content: 'summary_large_image'});
	}
}
