/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {Router, NavigationStart, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

import {Constants} from 'builds/hyperpass-common';
import {Animations} from 'hyperpass-core';

import {navbarOverlayFadeAnimation} from '../animations';


@Component
({
	selector: 'hyperpass-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
	animations: [Animations.fadeAnimation, navbarOverlayFadeAnimation],
	imports: [RouterLink, NgIf]
})

export class NavbarComponent implements OnInit
{
	public overlay = false;
	public overlayState = 'normal';
	public constants = Constants;


	// Constructor.
	public constructor(private readonly router: Router){}


	// Initializer.
	public ngOnInit(): void { this.removeOverlayOnNavigation(); }


	// Show the navbar overlay.
	public showOverlay(): void
	{
		this.overlay = true;
		this.overlayState = 'normal';
	}


	// Hide the navbar overlay.
	public hideOverlay(): void { this.overlay = false; }


	// On navigation, remove the navbar overlay if it is open.
	private removeOverlayOnNavigation(): void
	{
		this.router.events.subscribe((event) =>
		{
			if(!this.overlay || !(event instanceof NavigationStart)) return;

			this.overlayState = 'navigation';
			setTimeout(() => { this.overlay = false; });
		});
	}
}
