/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import * as Capacitor from '@capacitor/core';
import * as Ionic from '@ionic/angular';

import type * as Types from '../types';
import * as Settings from '../settings';
import {StorageService} from './storage.service';


const lightTheme =
{
	'main-color': 'rgb(242, 244, 249)',
	'alternate-color': 'rgb(229, 234, 244)',
	'accent-color': 'rgb(249, 250, 252)',
	'semitransparent-accent-color': 'rgb(252, 252, 253, .5)',
	'alternate-accent-color': 'rgb(255, 255, 255)',
	'background-color': 'var(--main-color)',
	'semitransparent-background-color': 'rgb(242, 244, 249, .7)',
	'text-color': 'rgb(49, 57, 74)',
	'semitransparent-text-color': 'rgb(49, 67, 105, .4)',
	'selection-color': 'rgb(62, 105, 183, .1)',

	'shading-light-color': 'rgb(255, 255, 255, .8)',
	'shading-specular-color': 'var(--alternate-accent-color)',
	'shading-bloom-color': 'rgb(255, 255, 255, 0)',
	'shading-shadow-color': 'rgb(52, 73, 109, .2)',
	'shading-umbra-color': 'rgb(52, 73, 109, .15)'
};

const darkTheme =
{
	'main-color': 'rgb(28, 31, 35)',
	'alternate-color': 'rgb(20, 23, 27)',
	'accent-color': 'rgb(37, 41, 47)',
	'semitransparent-accent-color': 'rgb(37, 41, 47, .5)',
	'alternate-accent-color': 'rgb(47, 52, 61)',
	'background-color': 'var(--main-color)',
	'semitransparent-background-color': 'rgb(28, 31, 35, .8)',
	'text-color': 'rgb(211, 221, 234)',
	'semitransparent-text-color': 'rgb(190, 206, 226, .35)',
	'selection-color': 'rgb(190, 215, 255, .14)',

	'shading-light-color': 'rgb(207, 225, 255, .06)',
	'shading-specular-color': 'var(--alternate-accent-color)',
	'shading-bloom-color': 'rgb(255, 255, 255, 0)',
	'shading-shadow-color': 'rgb(7, 10, 12)',
	'shading-umbra-color': 'rgb(12, 12, 14)'
};


@Injectable({providedIn: 'root'})

export class ThemeService
{
	private theme: Types.Theme = 'Light';


	// Constructor.
	public constructor(private readonly storageService: StorageService,
		private readonly ionicPlatform: Ionic.Platform){}


	// Sets the theme.
	public async setTheme(theme?: Types.Theme): Promise<void>
	{
		// If manually set, save the theme.
		if(theme) await this.storageService.setData(Settings.themeKey, theme);

		// Otherwise, automatically determine the preferred theme.
		else theme = this.isDarkThemePreferred() ? 'Dark' : 'Light';
		this.theme = theme;

		// Apply the CSS.
		const css = (theme === 'Dark') ? darkTheme : lightTheme;

		for(const [key, value] of Object.entries(css))
			document.documentElement.style.setProperty(`--${key}`, value);

		// If on mobile, set the status bar.
		if(this.ionicPlatform.is('mobile'))
		{
			Capacitor.Plugins.StatusBar.setStyle({style: (theme === 'Dark') ?
				Capacitor.StatusBarStyle.Dark : Capacitor.StatusBarStyle.Light});

			Capacitor.Plugins.StatusBar.setBackgroundColor(
				{color: this.rgbToHex(css['alternate-color'])});
		}
	}


	// Returns the preferred theme name.
	public getThemeName(): Types.Theme { return this.theme; }


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
