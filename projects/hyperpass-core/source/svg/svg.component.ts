/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {Component, HostBinding, Input} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as _ from 'lodash';


const svgs: Record<string, string> =
{
	// Down arrow.
	'Down Arrow':
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<polyline class="glyph" points="10 13.5 16 18.5 22 13.5"/>
	</svg>`,

	// Up arrow.
	'Up Arrow':
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<polyline class="glyph" points="10 18.5 16 13.5 22 18.5"/>
	</svg>`,


	// Delete.
	'Delete':
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<line class="glyph" x1="2" y1="2" x2="30" y2="30"/>
		<line class="glyph" x1="2" y1="30" x2="30" y2="2"/>
	</svg>`,

	// Tags button.
	'Tags Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<polygon class="glyph" points="8.12 18.38 13.53 23.79 22.12 15.21 21.89 10.02 16.71 9.79 8.12 18.38"/>
		<circle class="glyph" cx="18.68" cy="13.02" r="0.05"/>
	</svg>`,


	// Add button.
	'Add Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<line class="glyph" x1="16" y1="9" x2="16" y2="23"/>
		<line class="glyph" x1="9" y1="16" x2="23" y2="16"/>
	</svg>`,


	// Username button.
	'Username Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M22.83,22.2a6.83,6.83,0,0,0-13.66,0"/>
		<circle class="glyph" cx="16" cy="11.79" r="3.59"/>
	</svg>`,

	// Password button.
	'Password Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<circle class="glyph" cx="11.25" cy="15.67" r="2.94"/>
		<polyline class="glyph" points="14.18 15.67 22.81 15.67 22.81 19.39"/>
		<line class="glyph" x1="19.49" y1="15.67" x2="19.49" y2="17.83"/>
		<path class="glyph" d="M20.39,15.67"/>
	</svg>`,

	// Holder button.
	'Holder Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M22.83,22.2a6.83,6.83,0,0,0-13.66,0"/>
		<circle class="glyph" cx="16" cy="11.79" r="3.59"/>
	</svg>`,

	// Number button.
	'Number Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<line class="glyph" x1="11.66" y1="22.88" x2="14.44" y2="9"/>
		<line class="glyph" x1="20.09" y1="9" x2="17.31" y2="22.88"/>
		<line class="glyph" x1="8.8" y1="18.33" x2="21.9" y2="18.33"/>
		<line class="glyph" x1="9.7" y1="13.35" x2="22.8" y2="13.35"/>
	</svg>`,

	// Expiration date button.
	'Expiration Date Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<rect class="glyph" x="9" y="10.5" width="14" height="11.5"/>
		<line class="glyph" x1="10.5" y1="10.5" x2="10.5" y2="8.43"/>
		<line class="glyph" x1="21.5" y1="10.5" x2="21.5" y2="8.36"/>
		<line class="glyph" x1="9" y1="13.5" x2="23" y2="13.5"/>
	</svg>`,

	// Security code button.
	'Security Code Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<rect class="glyph" x="11" y="15" width="10" height="7.5"/>
		<path class="glyph" d="M19.64,15.05v-3.5S19.64,8.5,16,8.5s-3.64,3.05-3.64,3.05v3.5"/>
	</svg>`,


	// History button.
	'History Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M9,16a7,7,0,1,1,7,7,7.12,7.12,0,0,1-6.53-4.47"/>
		<polyline class="glyph" points="6.61 13.75 9 16 11.88 14.03"/>
		<polyline class="glyph" points="16 11.5 16 16 19.5 16"/>
	</svg>`,

	// Generate button.
	'Generate Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<rect class="glyph" x="9" y="9" width="14" height="14" rx="3"/>
		<circle class="glyph" cx="12.5" cy="12.5" r="0.6"/>
		<circle class="glyph" cx="19.5" cy="12.5" r="0.6"/>
		<circle class="glyph" cx="16" cy="16" r="0.6"/>
		<circle class="glyph" cx="12.5" cy="19.5" r="0.6"/>
		<circle class="glyph" cx="19.5" cy="19.5" r="0.6"/>
	</svg>`,


	// Edit button.
	'Edit Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M21.19,8.75l2,2L12.12,22l-2.41.79a.29.29,0,0,1-.36-.37L10.18,20Z"/>
		<line class="glyph" x1="19.43" y1="10.55" x2="21.4" y2="12.52"/>
	</svg>`,

	// Delete button.
	'Delete Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<line class="glyph" x1="9.5" y1="9.5" x2="22.5" y2="22.5"/>
		<line class="glyph" x1="22.5" y1="9.5" x2="9.5" y2="22.5"/>
	</svg>`,

	// Copy button.
	'Copy Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<rect class="glyph" x="8.78" y="13.12" width="10" height="10"/>
		<polyline class="glyph" points="21.09 18.88 23.22 18.88 23.22 8.88 13.22 8.88 13.22 10.97"/>
	</svg>`,

	// Restore button.
	'Restore Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M9,16a7,7,0,1,1,7,7,7.12,7.12,0,0,1-6.53-4.47"/>
		<polyline class="glyph" points="6.61 13.75 9 16 11.88 14.03"/>
	</svg>`,


	// Previous button.
	'Previous Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M18.61,9.39l-8.8,6a.74.74,0,0,0,0,1.22l8.8,6a.76.76,0,0,0,1.2-.61V10A.76.76,0,0,0,18.61,9.39Z"/>
	</svg>`,

	// Next button.
	'Next Button':
	`<svg class="svg-button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
		<circle class="base" cx="16" cy="16" r="16"/>
		<path class="glyph" d="M13.43,9.39l8.8,6a.74.74,0,0,1,0,1.22l-8.8,6a.76.76,0,0,1-1.2-.61V10A.76.76,0,0,1,13.43,9.39Z"/>
	</svg>`,

	// Heart.
	'Heart':
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.12 26.15">
		<path class="glyph" d="M16,27.87c11.17-11,13.06-13.22,13.06-16.27,0-6.1-4.11-7.47-6.82-7.47a6.61,6.61,0,0,0-5.86,3.61.44.44,0,0,1-.76,0A6.61,6.61,0,0,0,9.76,4.13c-2.71,0-6.82,1.37-6.82,7.47C2.94,14.65,4.83,16.89,16,27.87Z" transform="translate(-1.94 -3.13)"/>
	</svg>`
};


@Component
({
	selector: 'hyperpass-svg',
	template: '',
	styles: [':host{ display: flex; border-radius: 50%; }']
})

export class SvgComponent implements OnInit
{
	@Input() public svg?: string;
	@HostBinding('innerHTML') public innerHtml: SafeHtml = '';


	// Constructor.
	public constructor(private readonly domSanitizer: DomSanitizer){}


	// Initializer.
	public ngOnInit(): void
	{
		if(!this.svg || !_.has(svgs, this.svg))
			throw new Error('Failed to load an SVG.');

		this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(svgs[this.svg]);
	}
}
