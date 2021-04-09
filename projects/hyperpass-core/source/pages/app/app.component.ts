/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {ElementRef, Component, HostBinding, HostListener,
	ViewChild, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import SwiperCore, {EffectFade} from 'swiper/core';
import {SwiperComponent} from 'swiper/angular';
import type {Subscription} from 'rxjs';
import * as Ionic from '@ionic/angular';
import * as Capacitor from '@capacitor/core';

import * as Animations from '../../animations';
import {AccountService} from '../../services/account.service';
import {StateService} from '../../services/state.service';
import {VaultComponent} from '../../pages/app/vault/vault.component';
import {PlatformService} from '../../services/platform.service';
import {MetadataService} from '../../services/metadata.service';


SwiperCore.use([EffectFade]);


@Component
({
	selector: 'hyperpass-app',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [Animations.delayedFadeAnimation, Animations.delayedFadeInAnimation]
})

export class AppComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'centerer-page';
	@ViewChild('modalOverlay') private readonly modalOverlay?: ElementRef;
	@ViewChild('swiper') private readonly swiper?: SwiperComponent;

	public tab: 'None'|'Vault'|'Generator'|'Options' = 'None';
	public vaultComponent = VaultComponent;
	public enableSwiping = false;
	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly accountService: AccountService,
		public readonly stateService: StateService,
		private readonly platformService: PlatformService,
		private readonly metadataService: MetadataService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly ionicPlatform: Ionic.Platform){}


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

		// Close on back button press.
		this.backButtonSubscription = this.ionicPlatform.backButton
			.subscribeWithPriority(-1, () => { Capacitor.Plugins.App.exitApp(); });

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


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Closes the modal if the modal overlay was clicked.
	public closeModal(event: MouseEvent): void
	{
		if(event.target === this.modalOverlay?.nativeElement)
			this.stateService.closeModals();
	}


	// Page navigation callback.
	public pageChangeCallback(): void
	{
		if(!this.swiper) return;

		switch(this.swiper.swiperRef.activeIndex)
		{
			case 0: this.tab = 'Vault'; break;
			case 1: this.tab = 'Generator'; break;
			case 2: this.tab = 'Options';
		}

		this.changeDetectorRef.detectChanges();
	}


	// Navigates to the given page.
	public setPage(index: number): void { this.swiper?.swiperRef.slideTo(index); }
}
