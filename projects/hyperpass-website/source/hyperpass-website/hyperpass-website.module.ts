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
import {ImageLoaderComponent} from './image-loader/image-loader.component';
import {IndexComponent} from './pages/index/index.component';
import {DownloadsComponent} from './pages/downloads/downloads.component';
import {SupportComponent} from './pages/support/support.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';

import {IntroductionComponent} from './pages/support/introduction/introduction.component';

import {AutofillingUsernamesAndPasswordsComponent} from './pages/support/common-tasks/autofilling-usernames-and-passwords/autofilling-usernames-and-passwords.component';
import {CreatingAndRestoringVaultBackupsComponent} from './pages/support/common-tasks/creating-and-restoring-vault-backups/creating-and-restoring-vault-backups.component';
import {CreatingVaultEntriesComponent} from './pages/support/common-tasks/creating-vault-entries/creating-vault-entries.component';
import {GeneratingPasswordsComponent} from './pages/support/common-tasks/generating-passwords/generating-passwords.component';
import {ImportingExistingAccountsComponent} from './pages/support/common-tasks/importing-existing-accounts/importing-existing-accounts.component';
import {ViewingAndRestoringVaultHistoryComponent} from './pages/support/common-tasks/viewing-and-restoring-vault-history/viewing-and-restoring-vault-history.component';

import {HowIsMyPrivateDataHandledComponent} from './pages/support/faq/how-is-my-private-data-handled/how-is-my-private-data-handled.component';
import {WhichAppsAndExtensionsShouldIUseComponent} from './pages/support/faq/which-apps-and-extensions-should-i-use/which-apps-and-extensions-should-i-use.component';
import {WhoIsBehindThisProjectComponent} from './pages/support/faq/who-is-behind-this-project/who-is-behind-this-project.component';
import {WhyUseHyperpassOverTheAlternativesComponent} from './pages/support/faq/why-use-hyperpass-over-the-alternatives/why-use-hyperpass-over-the-alternatives.component';
import {WhichTechnologiesDoesHyperpassUseComponent} from './pages/support/faq/which-technologies-does-hyperpass-use/which-technologies-does-hyperpass-use.component';


@NgModule
({
	declarations:
	[
		HyperpassWebsiteComponent,
		NavbarComponent,
		ImageLoaderComponent,
		IndexComponent,
		DownloadsComponent,
		SupportComponent,
		NotFoundComponent,

		IntroductionComponent,
		AutofillingUsernamesAndPasswordsComponent,
		CreatingAndRestoringVaultBackupsComponent,
		CreatingVaultEntriesComponent,
		GeneratingPasswordsComponent,
		ImportingExistingAccountsComponent,
		ViewingAndRestoringVaultHistoryComponent,
		HowIsMyPrivateDataHandledComponent,
		WhichAppsAndExtensionsShouldIUseComponent,
		WhoIsBehindThisProjectComponent,
		WhyUseHyperpassOverTheAlternativesComponent,
		WhichTechnologiesDoesHyperpassUseComponent
	],
	imports:
	[
		BrowserModule.withServerTransition({appId: 'hyperpass'}),
		HttpClientModule,
		FormsModule,
		SimplebarAngularModule,
		HyperpassCoreModule,
		RoutingModule
	],
	bootstrap: [HyperpassWebsiteComponent]
})


export class HyperpassWebsiteModule{}
