/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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
		BrowserAnimationsModule,
		HyperpassCoreModule,
		RoutingModule,
		NgxElectronModule
	],
	bootstrap: [HyperpassDesktopComponent]
})


export class HyperpassDesktopModule{}
