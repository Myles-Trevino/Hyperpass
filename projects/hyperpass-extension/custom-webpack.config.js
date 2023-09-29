/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


const CopyPlugin = require('copy-webpack-plugin');


module.exports =
{
	resolve: {fallback: {'crypto': false}},
	experiments: {topLevelAwait: true},
	plugins:
	[
		new CopyPlugin
		({
			patterns:
			[
				{from: 'projects/hyperpass-extension/source/manifest-firefox.json', to: 'manifest.json'},
				{from: 'LICENSE', to: '.'},
				{from: 'NOTICE', to: '.'},
				{from: 'projects/hyperpass-extension/source/hyperpass-extension/service-worker-wrapper.js', to: '.'}
			]
		})
	],
	entry:
	{
		'service-worker': 'projects/hyperpass-extension/source/hyperpass-extension/service-worker.ts',
		content: 'projects/hyperpass-extension/source/hyperpass-extension/content.ts'
	}
}
