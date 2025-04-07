/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode, importProvidersFrom} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';

import {environment} from './environments/environment';
import {HyperpassWebsiteModule} from './hyperpass-website/hyperpass-website.module';
import {HyperpassWebsiteComponent} from './hyperpass-website/hyperpass-website.component';


if(environment.production){ enableProdMode(); }

document.addEventListener('DOMContentLoaded', () =>
{
	'use strict';
	bootstrapApplication(HyperpassWebsiteComponent,
	{
		providers:
		[
			importProvidersFrom(HyperpassWebsiteModule),
			provideAnimations()
		]
	})
	.catch((error) => { console.error(error); });
});
