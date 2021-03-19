/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component
({
	selector: 'hyperpass-switch',
	templateUrl: './switch.component.html',
	styleUrls: ['./switch.component.scss']
})

export class SwitchComponent
{
	@Input() public state = false;
	@Output() public readonly stateChange = new EventEmitter<boolean>();


	// Toggles the state.
	public toggle(): void
	{
		this.state = !this.state;
		this.stateChange.emit(this.state);
	}
}
