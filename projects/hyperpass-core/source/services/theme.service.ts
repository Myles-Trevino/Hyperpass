/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import {StatusBar, Style} from '@capacitor/status-bar';

import {Types, Constants} from 'builds/hyperpass-common';

import {StorageService} from './storage.service';
import {PlatformService} from '../services/platform.service';


const lightTheme =
{
	'main-color': 'rgb(242, 244, 249)',
	'alternate-color': 'rgb(229, 234, 244)',
	'semitransparent-alternate-color': 'rgb(229, 234, 244, 0.75)',
	'accent-color': 'rgb(249, 250, 252)',
	'semitransparent-accent-color': 'rgb(252, 252, 253, 0.5)',
	'alternate-accent-color': 'rgb(255, 255, 255)',
	'background-color': 'var(--main-color)',
	'semitransparent-background-color': 'rgb(242, 244, 249, 0.7)',
	'text-color': 'rgb(49, 57, 74)',
	'semitransparent-text-color': 'rgb(49, 67, 105, 0.4)',
	'selection-color': 'rgb(62, 105, 183, 0.1)',

	'shading-light-color': 'rgb(255, 255, 255, 0.8)',
	'shading-specular-color': 'var(--alternate-accent-color)',
	'shading-bloom-color': 'rgb(255, 255, 255, 0)',
	'shading-shadow-color': 'rgb(52, 73, 109, 0.2)',
	'shading-umbra-color': 'rgb(52, 73, 109, 0.15)'
};

const darkTheme =
{
	'main-color': 'rgb(28, 31, 35)',
	'alternate-color': 'rgb(20, 23, 27)',
	'semitransparent-alternate-color': 'rgb(20, 23, 27, 0.75)',
	'accent-color': 'rgb(37, 41, 47)',
	'semitransparent-accent-color': 'rgb(37, 41, 47, 0.5)',
	'alternate-accent-color': 'rgb(47, 52, 61)',
	'background-color': 'var(--main-color)',
	'semitransparent-background-color': 'rgb(28, 31, 35, 0.8)',
	'text-color': 'rgb(211, 221, 234)',
	'semitransparent-text-color': 'rgb(190, 206, 226, 0.35)',
	'selection-color': 'rgb(190, 215, 255, 0.14)',

	'shading-light-color': 'rgb(207, 225, 255, 0.06)',
	'shading-specular-color': 'var(--alternate-accent-color)',
	'shading-bloom-color': 'rgb(255, 255, 255, 0)',
	'shading-shadow-color': 'rgb(7, 10, 12)',
	'shading-umbra-color': 'rgb(12, 12, 14)'
};


@Injectable({providedIn: 'root'})

export class ThemeService
{
	public theme: Types.Theme = Constants.defaultTheme;
	public lowercaseTheme = this.theme.toLowerCase();


	// Constructor.
	public constructor(private readonly storageService: StorageService,
		private readonly platformService: PlatformService){}


	// Sets and applies the given theme.
	public async setTheme(theme?: Types.Theme): Promise<void>
	{
		// If a theme has been manually set, cache it.
		if(theme)
		{
			this.theme = theme;
			await this.storageService.setData(Constants.themeKey, this.theme);
		}

		// Otherwise, if no theme was manually set...
		else
		{
			// If a theme is cached, set the cached theme.
			const cachedTheme = await this.storageService.getData(Constants.themeKey);
			if(cachedTheme && Types.isTheme(cachedTheme)) this.theme = cachedTheme;

			// If no theme is cached, set the theme based on OS preference.
			else
			{
				this.theme = this.isDarkThemePreferred() ? 'Dark' : 'Light';
				this.lowercaseTheme = this.theme.toLowerCase();
			}
		}

		// Apply the theme.
		await this.applyTheme();
	}


	// Applies the current theme.
	public async applyTheme(): Promise<void>
	{
		// Apply the CSS.
		const css = (this.theme === 'Dark') ? darkTheme : lightTheme;

		for(const [key, value] of Object.entries(css))
			document.documentElement.style.setProperty(`--${key}`, value);

		// If on mobile, apply the status bar attributes.
		if(this.platformService.isMobile)
		{
			await StatusBar.setStyle(
				{style: (this.theme === 'Dark') ? Style.Dark : Style.Light});

			await StatusBar.setBackgroundColor(
				{color: this.rgbToHex(css['alternate-color'])});
		}
	}


	// Returns whether the dark theme is preferred.
	private isDarkThemePreferred(): boolean
	{ return window.matchMedia('(prefers-color-scheme: dark)').matches; }


	// Converts the given RGB string to hex.
	private decimalToHex(decimal: string): string
	{
		const result = parseInt(decimal).toString(16);
		return (result.length === 1) ? `0${result}` : result;
	}


	private rgbToHex(rgb: string): string
	{
		const result = /(\d+), (\d+), (\d+)/g.exec(rgb);
		if(!result) throw new Error('Failed to convert a color value.');

		return `#${this.decimalToHex(result[1])}${this.decimalToHex(result[2])}`+
			`${this.decimalToHex(result[3])}`;
	}
}
