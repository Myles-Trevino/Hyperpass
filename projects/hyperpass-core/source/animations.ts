/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {trigger, animate, transition, style} from '@angular/animations';


// Initial fade.
export const initialFadeAnimation = trigger('initialFadeAnimation', [transition(
	':enter', [style({opacity: 0}), animate('.32s .5s', style({opacity: 1}))])]);


// Fade in.
export const fadeInAnimation = trigger('fadeInAnimation', [transition(
	':enter', [style({opacity: 0}), animate('.32s', style({opacity: 1}))])]);


// Delayed fade in.
export const delayedFadeInAnimation = trigger('delayedFadeInAnimation', [transition(
	':enter', [style({opacity: 0}), animate('.32s .5s', style({opacity: 1}))])]);


// Fade in and out.
export const fadeAnimation = trigger('fadeAnimation',
	[
		transition(':enter', [style({opacity: 0}), animate('.08s', style({opacity: 1}))]),
		transition(':leave', [animate('.08s', style({opacity: 0}))])
	]);


// Delayed fade in and out.
export const delayedFadeAnimation = trigger('delayedFadeAnimation',
	[
		transition(':enter', [style({opacity: 0}),
			animate('.08s .08s', style({opacity: 1}))]),
		transition(':leave', [animate('.08s', style({opacity: 0}))])
	]);
