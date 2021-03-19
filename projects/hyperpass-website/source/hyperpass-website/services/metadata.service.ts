/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';
import {NavigationStart, Router} from '@angular/router';

import {Settings} from 'hyperpass-core';


type Metadata =
{
	title?: string;
	description: string;
	image?: string;
};


@Injectable({providedIn: 'root'})

export class MetadataService
{
	private readonly pageMetadata: Record<string, Metadata> =
	{
		'index':
		{
			description: 'Hyperpass helps you be more digitally organized and secure. '+
				'Forgotten usernames and passwords are a thing of the past. Get quick '+
				'access to all of your account information on any device.'
		},

		'app':
		{
			title: 'Web App',
			description: 'The Hyperpass web app. Access and '+
				'manage all your accounts from your browser.'
		},

		'download':
		{
			title: 'Download',
			description: 'The download page for the Hyperpass '+
				'browser extensions, mobile apps, and desktop apps.'
		},

		'login':
		{
			title: 'Login',
			description: 'Log in to start using the Hyperpass web app.'
		},

		'signup':
		{
			title: 'Signup',
			description: 'Create an account to start using Hyperpass.'
		},

		'support':
		{
			title: 'Support',
			description: 'Curious about how to use Hyperpass? You can check out '+
				'the introduction or delve into the documentation here.'
		},

		'not-found':
		{
			title: 'Not Found',
			description: 'Sorry, the requested page or resource couldn\'t '+
				'be found. Please check the URL or try again later.'
		}
	};

	public constructor(private readonly router: Router,
		private readonly titleService: Title,
		private readonly metaService: Meta){}


	// Initializer.
	public initialize(): void
	{
		this.router.events.subscribe((event) =>
		{
			if(event instanceof NavigationStart)
				this.setMetadata(event.url);
		});
	}


	// Sets the title.
	private setTitle(title?: string): void
	{
		title = title ? `${title} - Hyperpass` : 'Hyperpass';
		this.titleService.setTitle(title);
		this.metaService.addTag({property: 'og:title', content: title});
	}


	// Sets the description.
	private setDescription(description: string): void
	{
		this.metaService.addTags
		([
			{name: 'description', content: description},
			{property: 'og:description', content: description}
		]);
	}


	// Sets the image.
	private setImage(image = 'hyperpass.jpg'): void
	{
		const imageUrl = `${Settings.staticUrl}/images/metadata/${image}`;
		this.metaService.addTag({property: 'og:image', content: imageUrl});
		this.metaService.addTag({name: 'twitter:card', content: 'summary_large_image'});
	}


	// Clears the metadata.
	private clear(): void
	{
		this.metaService.removeTag('property=\'og:title\'');

		this.metaService.removeTag('name=\'description\'');
		this.metaService.removeTag('property=\'og:description\'');

		this.metaService.removeTag('property=\'og:image\'');
		this.metaService.removeTag('name=\'twitter:card\'');
	}


	// Sets the metadata.
	private setMetadata(page: string): void
	{
		if(!(page in this.pageMetadata)) return;

		const metadata = this.pageMetadata[page];
		this.clear();
		this.setTitle(metadata.title);
		this.setDescription(metadata.description);
		this.setImage(metadata.image);
	}
}
