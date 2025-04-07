/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';

import {ipcRenderer} from 'electron';


@Injectable({providedIn: 'root'})

export class ElectronService
{
	public ipcRenderer: typeof ipcRenderer;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
	public constructor(){ this.ipcRenderer = window.require('electron').ipcRenderer; }
}
