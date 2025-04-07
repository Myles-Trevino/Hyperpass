/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode, importProvidersFrom} from '@angular/core';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';


import {HyperpassCoreModule} from 'hyperpass-core';
import {environment} from './environments/environment';
import {RoutingModule} from './hyperpass-extension/routing.module';
import {HyperpassExtensionComponent} from './hyperpass-extension/hyperpass-extension.component';


if(environment.production){ enableProdMode(); }

bootstrapApplication(HyperpassExtensionComponent,
{
	providers:
	[
		importProvidersFrom(BrowserModule, HyperpassCoreModule, RoutingModule),
		provideAnimations()
	]
})
.catch((error) =>
{
	'use strict';
	console.error(error);
});
