/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {HyperpassDesktopModule} from './hyperpass-desktop/hyperpass-desktop.module';
import {environment} from './environments/environment';


if(environment.production){ enableProdMode(); }

platformBrowserDynamic().bootstrapModule(HyperpassDesktopModule)
	.catch((error) => { console.error(error); });
