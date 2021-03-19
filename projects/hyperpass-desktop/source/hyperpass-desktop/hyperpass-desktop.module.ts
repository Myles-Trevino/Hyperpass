/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgxElectronModule} from 'ngx-electron';

import {HyperpassCoreModule} from 'hyperpass-core';

import {RoutingModule} from './routing.module';
import {HyperpassDesktopComponent} from './hyperpass-desktop.component';


@NgModule
({
	declarations: [HyperpassDesktopComponent],
	imports:
	[
		BrowserModule,
		HyperpassCoreModule,
		RoutingModule,
		NgxElectronModule
	],
	bootstrap: [HyperpassDesktopComponent]
})

export class HyperpassDesktopModule{}
