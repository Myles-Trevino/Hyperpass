/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {provideServerRendering} from '@angular/platform-server';

import {HyperpassWebsiteModule} from './hyperpass-website.module';


@NgModule
({
	imports:
	[
		NoopAnimationsModule,
		HyperpassWebsiteModule,
		ServerModule
	],
	providers: [provideServerRendering()]
})

export class HyperpassWebsiteServerModule{}
