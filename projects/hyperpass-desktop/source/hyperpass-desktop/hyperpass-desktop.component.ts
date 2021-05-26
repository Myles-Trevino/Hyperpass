/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {ElectronService} from 'ngx-electron';

import {Animations, InitializationService, PlatformService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-desktop-root',
	templateUrl: './hyperpass-desktop.component.html',
	styleUrls: ['./hyperpass-desktop.component.scss'],
	animations: [Animations.initialFadeInAnimation]
})

export class HyperpassDesktopComponent implements OnInit
{
	public isMac = false;


	// Constructor.
	public constructor(public readonly initializationService: InitializationService,
		public readonly platformService: PlatformService,
		private readonly electronService: ElectronService){}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		await this.initializationService.initialize();
		this.isMac = (this.platformService.os === 'mac');
		setTimeout(() => { this.electronService.ipcRenderer.send('show-window'); }, 250);
	}


	// Window controls.
	public minimize(): void { this.electronService.ipcRenderer.send('minimize'); }
	public maximize(): void { this.electronService.ipcRenderer.send('maximize'); }
	public close(): void { this.electronService.ipcRenderer.send('close'); }
}
