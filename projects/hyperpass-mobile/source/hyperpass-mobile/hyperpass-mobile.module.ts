/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IonicModule} from '@ionic/angular';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {HyperpassCoreModule} from 'hyperpass-core';

import {RoutingModule} from './routing.module';
import {HyperpassMobileComponent} from './hyperpass-mobile.component';


@NgModule
({
	declarations: [HyperpassMobileComponent],
	imports:
	[
		BrowserModule,
		BrowserAnimationsModule,
		HyperpassCoreModule, /* Must be imported before RoutingModule. */
		RoutingModule,
		CommonModule,
		FormsModule
	],
	bootstrap: [HyperpassMobileComponent]
})

export class HyperpassMobileModule{}
