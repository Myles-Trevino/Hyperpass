/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {SimplebarAngularModule} from 'simplebar-angular';

import {HyperpassCoreModule} from 'hyperpass-core';

import {RoutingModule} from './routing.module';
import {HyperpassWebsiteComponent} from './hyperpass-website.component';
import {NavbarComponent} from './navbar/navbar.component';
import {IndexComponent} from './pages/index/index.component';
import {DownloadComponent} from './pages/download/download.component';
import {SupportComponent} from './pages/support/support.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';


@NgModule
({
	declarations:
	[
		HyperpassWebsiteComponent,
		NavbarComponent,
		IndexComponent,
		DownloadComponent,
		SupportComponent,
		NotFoundComponent
	],
	imports:
	[
		BrowserModule.withServerTransition({appId: 'hyperpass'}),
		HttpClientModule,
		FormsModule,
		SimplebarAngularModule,
		HyperpassCoreModule, /* Must be imported before RoutingModule. */
		RoutingModule
	],
	bootstrap: [HyperpassWebsiteComponent]
})


export class HyperpassWebsiteModule{}
