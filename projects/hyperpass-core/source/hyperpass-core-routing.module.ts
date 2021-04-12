/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import type {Routes} from '@angular/router';
import {RouterModule} from '@angular/router';

import {LoginComponent} from './pages/login/login.component';
import {SignupComponent} from './pages/signup/signup.component';
import {ValidationComponent} from './pages/validation/validation.component';
import {AppComponent} from './pages/app/app.component';

import {VaultComponent} from './pages/app/vault/vault.component';
import {VaultEntryComponent} from './pages/app/vault-entry/vault-entry.component';

import {GeneratorComponent} from './pages/app/generator/generator.component';

import {OptionsComponent} from './pages/app/options/options.component';
import {ImportVaultComponent} from './pages/app/import-vault/import-vault.component';
import {ExportVaultComponent} from './pages/app/export-vault/export-vault.component';
import {MasterPasswordComponent} from './pages/app/master-password/master-password.component';
import {BiometricLoginComponent} from './pages/app/biometric-login/biometric-login.component';


const routes: Routes =
[
	{
		path: 'app',
		component: AppComponent,
		children:
		[
			{path: '', component: VaultComponent, outlet: 'vault'},
			{path: 'vault-entry', component: VaultEntryComponent, outlet: 'vault'},

			{path: 'generator', component: GeneratorComponent},

			{path: '', component: OptionsComponent, outlet: 'options'},
			{path: 'import-vault', component: ImportVaultComponent, outlet: 'options'},
			{path: 'export-vault', component: ExportVaultComponent, outlet: 'options'},
			{path: 'master-password', component: MasterPasswordComponent, outlet: 'options'},
			{path: 'biometric-login', component: BiometricLoginComponent, outlet: 'options'}
		]
	},

	{path: 'login', component: LoginComponent},
	{path: 'signup', component: SignupComponent},
	{path: 'validation', component: ValidationComponent}
];


export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule
({
	imports: [routerModuleForChild],
	exports: [RouterModule]
})

export class HyperpassCoreRoutingModule{}
