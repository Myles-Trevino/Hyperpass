/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {ApplicationRef, enableProdMode, importProvidersFrom} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {environment} from './environments/environment';
import {HyperpassWebsiteServerModule} from './hyperpass-website/hyperpass-website.server.module';
import {HyperpassWebsiteComponent} from './hyperpass-website/hyperpass-website.component';


export const Server = () : Promise<ApplicationRef> =>
{
	'use strict';

	if(environment.production){ enableProdMode(); }

	return bootstrapApplication(HyperpassWebsiteComponent,
	{
		providers: [importProvidersFrom(HyperpassWebsiteServerModule)]
	})
};
