/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HyperpassWebsiteModule} from './hyperpass-website.module';


@NgModule
({
	imports:
	[
		BrowserAnimationsModule,
		HyperpassWebsiteModule
	]
})

export class HyperpassWebsiteBrowserModule{}
