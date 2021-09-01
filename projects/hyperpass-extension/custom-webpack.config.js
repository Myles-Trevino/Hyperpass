/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


module.exports =
{
	resolve: {fallback: {"crypto": false}},
	entry:
	{
		background: 'projects/hyperpass-extension/source/hyperpass-extension/background.ts',
		content: 'projects/hyperpass-extension/source/hyperpass-extension/content.ts'
	}
}
