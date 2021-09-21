/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {NgModule} from '@angular/core';
import type {Routes} from '@angular/router';
import {RouterModule} from '@angular/router';

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

import {HowDoISelfHostHyperpassComponent} from './pages/support/faq/how-do-i-self-host-hyperpass/how-do-i-self-host-hyperpass.component';
import {HowIsMyPrivateDataHandledComponent} from './pages/support/faq/how-is-my-private-data-handled/how-is-my-private-data-handled.component';
import {WhichAppsAndExtensionsShouldIUseComponent} from './pages/support/faq/which-apps-and-extensions-should-i-use/which-apps-and-extensions-should-i-use.component';
import {WhoIsBehindThisProjectComponent} from './pages/support/faq/who-is-behind-this-project/who-is-behind-this-project.component';
import {WhyUseHyperpassOverTheAlternativesComponent} from './pages/support/faq/why-use-hyperpass-over-the-alternatives/why-use-hyperpass-over-the-alternatives.component';
import {WhichTechnologiesDoesHyperpassUseComponent} from './pages/support/faq/which-technologies-does-hyperpass-use/which-technologies-does-hyperpass-use.component';


const routes: Routes =
[
	{path: '', pathMatch: 'full', component: IndexComponent},

	{path: 'downloads', component: DownloadsComponent},

	{path: 'support', component: SupportComponent},
	{path: 'support/introduction', component: IntroductionComponent},

	{path: 'support/common-tasks/autofilling-usernames-and-passwords',
		component: AutofillingUsernamesAndPasswordsComponent},
	{path: 'support/common-tasks/creating-and-restoring-vault-backups',
		component: CreatingAndRestoringVaultBackupsComponent},
	{path: 'support/common-tasks/creating-vault-entries',
		component: CreatingVaultEntriesComponent},
	{path: 'support/common-tasks/generating-passwords',
		component: GeneratingPasswordsComponent},
	{path: 'support/common-tasks/importing-existing-accounts',
		component: ImportingExistingAccountsComponent},
	{path: 'support/common-tasks/viewing-and-restoring-vault-history',
		component: ViewingAndRestoringVaultHistoryComponent},

	{path: 'support/faq/how-do-i-self-host-hyperpass',
		component: HowDoISelfHostHyperpassComponent},
	{path: 'support/faq/how-is-my-private-data-handled',
		component: HowIsMyPrivateDataHandledComponent},
	{path: 'support/faq/which-apps-and-extensions-should-i-use',
		component: WhichAppsAndExtensionsShouldIUseComponent},
	{path: 'support/faq/who-is-behind-this-project',
		component: WhoIsBehindThisProjectComponent},
	{path: 'support/faq/why-use-hyperpass-over-the-alternatives',
		component: WhyUseHyperpassOverTheAlternativesComponent},
	{path: 'support/faq/which-technologies-does-hyperpass-use',
		component: WhichTechnologiesDoesHyperpassUseComponent},

	{path: '**', component: NotFoundComponent}
];


@NgModule
({
	imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'top'})],
	exports: [RouterModule]
})

export class RoutingModule{}
