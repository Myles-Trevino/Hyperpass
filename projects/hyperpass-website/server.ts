/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import 'zone.js';

import {CommonEngine, CommonEngineRenderOptions} from '@angular/ssr';
import Express from 'express';
import Helmet from 'helmet';
import {join} from 'path';

import {HyperpassWebsiteServerModule} from './source/main.server';
import {APP_BASE_HREF} from '@angular/common';


// Starts the application.
export function app(): Express.Express
{
	const server = Express();
	const browserFolder = join(process.cwd(), 'builds/hyperpass-website/browser');

	// Configure the Universal express engine.
	const engine = new CommonEngine({bootstrap: HyperpassWebsiteServerModule});

	server.engine('html', (
		filePath: string,
		options: object,
		callback: (err?: Error | null, html?: string) => void) =>
	{
		const renderOptions = {...options} as CommonEngineRenderOptions;
		renderOptions.documentFilePath = filePath;

		/* eslint-disable-next-line */
		renderOptions.publicPath = (options as any).settings?.views;

		engine
			.render(renderOptions)
			.then((html) => { callback(null, html); })
			.catch(callback);
	});

	server.set('view engine', 'html');
	server.set('views', browserFolder);
	server.disable('x-powered-by');

	// Content security policy.
	server.use
	(
		Helmet
		({
			contentSecurityPolicy:
			{
				directives:
				{
					'connect-src': ['*', 'data:'],
					'script-src': [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
					'script-src-attr': [`'unsafe-inline'`]
				}
			}
		})
	);

	// Serve static files from /browser.
	server.get('*.*', Express.static(browserFolder, {maxAge: '10m'}));

	// Otherwise use the Universal engine.
	server.get('*', (req, res) =>
	{
		res.render('index', {req, providers:
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
		console.log(`The Hyperpass website server has been `+
			`started on port ${port} (http://localhost:${port}).`);
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
