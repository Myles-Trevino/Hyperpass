/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import 'zone.js/node';

import {ngExpressEngine} from '@nguniversal/express-engine';
import Express from 'express';
import {join} from 'path';

import {HyperpassWebsiteServerModule} from './source/main.server';
import {APP_BASE_HREF} from '@angular/common';


// Starts the application.
export function app(): Express.Express
{
	const server = Express();
	const browserFolder = join(process.cwd(), 'builds/hyperpass-website/browser');
	const indexFile = 'index';

	// Configure the Universal express engine.
	server.engine('html', ngExpressEngine({bootstrap: HyperpassWebsiteServerModule}));
	server.set('view engine', 'html');
	server.set('views', browserFolder);
	server.disable('x-powered-by');

	// Serve static files from /browser.
	server.get('*.*', Express.static(browserFolder, {maxAge: '10m'}));

	// Otherwise use the Universal engine.
	server.get('*', (req, res) =>
	{
		res.render(indexFile, {req, providers:
			[{provide: APP_BASE_HREF, useValue: req.baseUrl}]});
	});

	return server;
}


// Starts the Node server.
function run(): void
{
	const port = process.env.PORT ?? 4001;
	const server = app();

	server.listen(port, () =>
	{
		console.log(`Express is listening on http://localhost:${port}`);
	});
}


/* eslint-disable */
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if(moduleFilename === __filename || moduleFilename.includes('iisnode'))
{
	run();
}


export * from './source/main.server';
