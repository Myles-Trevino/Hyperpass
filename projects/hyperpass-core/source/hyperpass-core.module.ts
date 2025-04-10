/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {provideHttpClient} from '@angular/common/http'
import {ClipboardModule} from '@angular/cdk/clipboard';
import {RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';
import {NgScrollbarModule, NG_SCROLLBAR_OPTIONS} from 'ngx-scrollbar';
import {SwiperModule} from 'swiper/angular';

import {RoutingModule} from './routing.module';
import {AutofocusDirective} from './autofocus.directive';

import {LoginComponent} from './pages/login/login.component';
import {SignupComponent} from './pages/signup/signup.component';
import {ValidationComponent} from './pages/validation/validation.component';
import {ApiServerComponent} from './pages/api-server/api-server.component';
import {AppComponent} from './pages/app/app.component';

import {VaultComponent} from './pages/app/vault/vault.component';
import {VaultEntryComponent} from './pages/app/vault-entry/vault-entry.component';
import {GeneratorComponent} from './pages/app/generator/generator.component';
import {OptionsComponent} from './pages/app/options/options.component';
import {ImportVaultComponent} from './pages/app/import-vault/import-vault.component';
import {ExportVaultComponent} from './pages/app/export-vault/export-vault.component';
import {BiometricLoginComponent} from './pages/app/biometric-login/biometric-login.component';
import {EmailAddressComponent} from './pages/app/email-address/email-address.component';
import {MasterPasswordComponent} from './pages/app/master-password/master-password.component';
import {DeleteAccountComponent} from './pages/app/delete-account/delete-account.component';

import {MessageComponent} from './message/message.component';
import {DropdownComponent} from './dropdown/dropdown.component';
import {MasterPasswordInputComponent} from './master-password-input/master-password-input.component';
import {SwitchComponent} from './switch/switch.component';
import {SvgComponent} from './svg/svg.component';
import {TagColorComponent} from './pages/app/tag-color/tag-color.component';
import {TagListComponent} from './pages/app/vault-entry/tag-list/tag-list.component';

import {TagsModalComponent} from './pages/app/tags-modal/tags-modal.component';
import {VaultHistoryModalComponent} from './pages/app/history-modal/vault-history-modal/vault-history-modal.component';
import {VaultEntryHistoryModalComponent} from './pages/app/history-modal/vault-entry-history-modal/vault-entry-history-modal.component';


@NgModule
({
	imports:
	[
		CommonModule,
		FormsModule,
		ClipboardModule,
		RouterModule,
		NgScrollbarModule,
		IonicModule.forRoot(),
		SwiperModule,
		LoginComponent,
		SignupComponent,
		ValidationComponent,
		ApiServerComponent,
		AppComponent,
		AutofocusDirective,
		VaultComponent,
		VaultEntryComponent,
		GeneratorComponent,
		OptionsComponent,
		ImportVaultComponent,
		ExportVaultComponent,
		BiometricLoginComponent,
		EmailAddressComponent,
		MasterPasswordComponent,
		DeleteAccountComponent,
		MessageComponent,
		DropdownComponent,
		MasterPasswordInputComponent,
		SwitchComponent,
		SvgComponent,
		TagColorComponent,
		TagListComponent,
		TagsModalComponent,
		VaultHistoryModalComponent,
		VaultEntryHistoryModalComponent,
		RoutingModule
	],
	exports:
	[
		MessageComponent,
		DropdownComponent,
		SwitchComponent
	],
	providers:
	[
		provideHttpClient(),
		{
			provide: NG_SCROLLBAR_OPTIONS,
			useValue: {visibility: 'hover'}
		}
	]
})

export class HyperpassCoreModule{}
