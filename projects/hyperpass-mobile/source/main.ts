/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode, importProvidersFrom} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';

import {HyperpassCoreModule} from 'hyperpass-core';
import {environment} from './environments/environment';
import {RoutingModule} from './hyperpass-mobile/routing.module';
import {HyperpassMobileComponent} from './hyperpass-mobile/hyperpass-mobile.component';


if(environment.production) enableProdMode();

bootstrapApplication(HyperpassMobileComponent,
{
	providers:
	[
		importProvidersFrom(BrowserModule, HyperpassCoreModule /* Must be before RoutingModule. */, RoutingModule, CommonModule, FormsModule),
		provideAnimations()
	]
})
.catch((error) =>
{
	'use strict';
	console.log(error);
});
