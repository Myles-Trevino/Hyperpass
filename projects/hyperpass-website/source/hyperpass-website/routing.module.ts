/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent, SignupComponent, ValidationComponent} from 'hyperpass-core';

import {IndexComponent} from './pages/index/index.component';
import {DownloadComponent} from './pages/download/download.component';
import {SupportComponent} from './pages/support/support.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';


const routes: Routes =
[
	{path: '', pathMatch: 'full', component: IndexComponent},
	{path: 'login', component: LoginComponent},
	{path: 'signup', component: SignupComponent},
	{path: 'validation', component: ValidationComponent},
	{path: 'download', component: DownloadComponent},
	{path: 'support', component: SupportComponent},
	{path: '**', component: NotFoundComponent}
];


@NgModule
({
	imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'top'})],
	exports: [RouterModule]
})

export class RoutingModule{}
