/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {RouterModule} from '@angular/router';
import {IonicModule} from '@ionic/angular';

import {SimplebarAngularModule} from 'simplebar-angular';

import {HyperpassCoreRoutingModule} from './hyperpass-core-routing.module';

import {LoginComponent} from './pages/login/login.component';
import {SignupComponent} from './pages/signup/signup.component';
import {ValidationComponent} from './pages/validation/validation.component';
import {AppComponent} from './pages/app/app.component';
import {VaultComponent} from './pages/app/vault/vault.component';
import {VaultEntryComponent} from './pages/app/vault-entry/vault-entry.component';
import {AccountComponent} from './pages/app/vault-entry/account/account.component';
import {CardComponent} from './pages/app/vault-entry/card/card.component';
import {NoteComponent} from './pages/app/vault-entry/note/note.component';
import {GeneratorComponent} from './pages/app/generator/generator.component';
import {OptionsComponent} from './pages/app/options/options.component';
import {ImportVaultComponent} from './pages/app/import-vault/import-vault.component';
import {ExportVaultComponent} from './pages/app/export-vault/export-vault.component';
import {MasterPasswordComponent} from './pages/app/master-password/master-password.component';

import {MessageComponent} from './message/message.component';
import {DropdownComponent} from './dropdown/dropdown.component';
import {SwitchComponent} from './switch/switch.component';
import {SvgComponent} from './svg/svg.component';
import {TagColorComponent} from './pages/app/tag-color/tag-color.component';
import {TagListComponent} from './pages/app/vault-entry/tag-list/tag-list.component';

import {TagsModalComponent} from './pages/app/tags-modal/tags-modal.component';
import {VaultHistoryModalComponent} from './pages/app/history-modal/vault-history-modal/vault-history-modal.component';
import {InputHistoryModalComponent} from './pages/app/history-modal/input-history-modal/input-history-modal.component';


@NgModule
({
	declarations:
	[
		LoginComponent,
		SignupComponent,
		ValidationComponent,
		AppComponent,
		VaultComponent,
		VaultEntryComponent,
		AccountComponent,
		CardComponent,
		NoteComponent,
		GeneratorComponent,
		OptionsComponent,
		ImportVaultComponent,
		ExportVaultComponent,
		MasterPasswordComponent,

		MessageComponent,
		DropdownComponent,
		SwitchComponent,
		SvgComponent,
		TagColorComponent,
		TagListComponent,

		TagsModalComponent,
		VaultHistoryModalComponent,
		InputHistoryModalComponent
	],
	imports:
	[
		CommonModule,
		FormsModule,
		HttpClientModule,
		ClipboardModule,
		RouterModule,
		SimplebarAngularModule,
		IonicModule.forRoot(),
		HyperpassCoreRoutingModule
	],
	exports:
	[
		MessageComponent,
		DropdownComponent,
		SwitchComponent
	]
})

export class HyperpassCoreModule{}
