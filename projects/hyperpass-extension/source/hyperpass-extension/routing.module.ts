/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {AppComponent, LoginComponent, SignupComponent,
	ValidationComponent} from 'hyperpass-core';


const routes: Routes =
[
	{path: 'app', component: AppComponent},
	{path: 'login', component: LoginComponent},
	{path: 'signup', component: SignupComponent},
	{path: 'validation', component: ValidationComponent}
];


@NgModule
({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class RoutingModule{}
