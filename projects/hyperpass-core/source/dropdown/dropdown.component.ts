/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Component, Input, Output, ViewChild, HostListener,
	ElementRef, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {NgIf, NgFor} from '@angular/common';

import * as Animations from '../animations';
import {SvgComponent} from '../svg/svg.component';


@Component
({
	selector: 'hyperpass-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.scss'],
	animations: [Animations.fadeAnimation],
	imports: [NgIf, SvgComponent, NgFor]
})

export class DropdownComponent<T1 extends Iterable<T2>, T2>
{
	@Input() public options?: T1;
	@Input() public selectedOption?: T2;
	@Output() public readonly selectedOptionChange = new EventEmitter<T2>();

	@ViewChild('dropdownHead', {read: ElementRef, static: false})
	private readonly dropdownHead?: ElementRef;

	public show = false;


	// Constructor.
	public constructor(private readonly changeDetectorRef: ChangeDetectorRef){}


	// Click callback.
	@HostListener('document:click', ['$event'])
	public clickCallback(event: MouseEvent): void
	{
		const headElement: ElementRef<HTMLElement> | undefined = this.dropdownHead;

		if(!headElement) throw new Error('No dropdown head element.');
		if(!event.target) throw new Error('No dropdown target element.');

		if(headElement.nativeElement.contains(event.target as Node)) this.toggle();
		else this.hide();
	}


	// Sets the selected option.
	public set(option: T2): void
	{
		this.selectedOption = option;
		this.selectedOptionChange.emit(this.selectedOption);
		this.hide();
	}


	// Toggles the dropdown.
	private toggle(): void
	{
		this.show = !this.show;
		this.changeDetectorRef.detectChanges();
	}


	// Hides the dropdown.
	private hide(): void
	{
		this.show = false;
		this.changeDetectorRef.detectChanges();
	}
}
