/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {trigger, animate, transition, state, style} from '@angular/animations';


export const imageFadeAnimation = trigger
(
	'imageFadeAnimation',
	[
		state('show', style({opacity: 1})),
		state('hide', style({opacity: 0})),
		transition('hide => show', animate('.2s'))
	]
);
