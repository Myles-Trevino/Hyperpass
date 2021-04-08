/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit} from '@angular/core';
import {ElementRef, Component, HostBinding, HostListener, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import * as Ionic from '@ionic/angular';

import * as Animations from '../../animations';
import {AccountService} from '../../services/account.service';
import {StateService} from '../../services/state.service';
import {VaultComponent} from '../../pages/app/vault/vault.component';
import {PlatformService} from '../../services/platform.service';
import {MetadataService} from '../../services/metadata.service';


@Component
({
	selector: 'hyperpass-app',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [Animations.fadeAnimation, Animations.delayedFadeInAnimation]
})

export class AppComponent implements OnInit
{
	@HostBinding('class') public readonly class = 'centerer-page';
	@ViewChild('modalOverlay') private readonly modalOverlay?: ElementRef;
	@ViewChild('ionSlides') private readonly ionSlides?: Ionic.IonSlides;

	public tab: 'None'|'Vault'|'Generator'|'Options' = 'None';
	public vaultComponent = VaultComponent;
	public enableSwiping = false;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly accountService: AccountService,
		public readonly stateService: StateService,
		private readonly platformService: PlatformService,
		private readonly metadataService: MetadataService){}


	// Pointer movement callback.
	@HostListener('window:pointermove')
	public pointerMoveCallback(): void { this.accountService.resetLoginTimeout(); }


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Web App');
		this.metadataService.setDescription('Access Hyperpass from your browser.');
		this.metadataService.setImage('web-app');

		if(this.platformService.isServer()) return;

		// If not logged in, attempt to log in with the cached login data.
		if(!this.accountService.loggedIn) await this.accountService.automaticLogIn();

		// If automatic login failed, redirect to the login page.
		if(!this.accountService.loggedIn)
		{
			this.router.navigate(['/login']);
			return;
		}

		// Otherwise, initialize.
		this.enableSwiping = this.platformService.isMobile();
		this.tab = 'Vault';
	}


	// Closes the modal if the modal overlay was clicked.
	public closeModal(event: MouseEvent): void
	{
		if(event.target === this.modalOverlay?.nativeElement)
			this.stateService.closeModals();
	}


	// Ion Slides callback.
	public async ionSlidesCallback(): Promise<void>
	{
		if(!this.ionSlides) return;

		const index = await this.ionSlides.getActiveIndex();

		switch(index)
		{
			case 0: this.tab = 'Vault'; break;
			case 1: this.tab = 'Generator'; break;
			case 2: this.tab = 'Options';
		}
	}


	// Sets Ion Slides to the given index.
	public setIonSlide(index: number): void
	{
		if(!this.ionSlides) return;
		this.ionSlides.slideTo(index);
	}
}
