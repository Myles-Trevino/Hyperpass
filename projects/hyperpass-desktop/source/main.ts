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
import {RoutingModule} from './hyperpass-desktop/routing.module';
import {HyperpassDesktopComponent} from './hyperpass-desktop/hyperpass-desktop.component';


if(environment.production){ enableProdMode(); }

bootstrapApplication(HyperpassDesktopComponent,
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
