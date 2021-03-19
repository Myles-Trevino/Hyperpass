/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {environment} from './environments/environment';
import {HyperpassMobileModule} from './hyperpass-mobile/hyperpass-mobile.module';


if(environment.production) enableProdMode();

platformBrowserDynamic().bootstrapModule(HyperpassMobileModule)
	.catch((error) => { console.log(error); });
