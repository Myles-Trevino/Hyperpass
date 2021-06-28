/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgScrollbarModule} from 'ngx-scrollbar';

import {HyperpassCoreModule} from 'hyperpass-core';

import {RoutingModule} from './routing.module';
import {HyperpassExtensionComponent} from './hyperpass-extension.component';


@NgModule
({
	declarations: [HyperpassExtensionComponent],
	imports:
	[
		BrowserModule,
		BrowserAnimationsModule,
		NgScrollbarModule.withConfig({visibility: 'hover',
			viewClass: 'scrollbar-container'}),
		HyperpassCoreModule,
		RoutingModule
	],
	bootstrap: [HyperpassExtensionComponent]
})

export class HyperpassExtensionModule{}
