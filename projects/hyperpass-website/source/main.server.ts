/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {enableProdMode} from '@angular/core';

import {environment} from './environments/environment';


if(environment.production){ enableProdMode(); }


export {HyperpassWebsiteServerModule} from './hyperpass-website/hyperpass-website.server.module';
export {renderModule, renderModuleFactory} from '@angular/platform-server';
