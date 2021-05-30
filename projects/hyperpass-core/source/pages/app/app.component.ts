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
import {App} from '@capacitor/app';
import * as Ionic from '@ionic/angular';
import * as _ from 'lodash';

import * as Types from '../../types';
import * as Animations from '../../animations';
import {AccountService} from '../../services/account.service';
import {StateService} from '../../services/state.service';
import {VaultComponent} from '../../pages/app/vault/vault.component';
import {PlatformService} from '../../services/platform.service';
import {MetadataService} from '../../services/metadata.service';
import {MessageService} from '../../services/message.service';
import {InitializationService} from '../../services/initialization.service';


SwiperCore.use([EffectFade]);


@Component
({
	selector: 'hyperpass-app',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [Animations.fadeAnimation, Animations.delayedFadeAnimation]
})

export class AppComponent implements OnInit, OnDestroy
{
	@HostBinding('class') public readonly class = 'centerer-page';
	@ViewChild('modalOverlay') private readonly modalOverlay?: ElementRef;
	@ViewChild('swiper') private readonly swiper?: SwiperComponent;

	public state: Types.AppState = _.clone(Types.defaultAppState);
	public initialized = false;
	public vaultComponent = VaultComponent;
	public enableSwiping = false;

	private backButtonSubscription?: Subscription;


	// Constructor.
	public constructor(
		public readonly stateService: StateService,
		public readonly initializationService: InitializationService,
		private readonly accountService: AccountService,
		private readonly platformService: PlatformService,
		private readonly metadataService: MetadataService,
		private readonly changeDetectorRef: ChangeDetectorRef,
		private readonly messageService: MessageService,
		private readonly ionicPlatform: Ionic.Platform,
		private readonly router: Router){}


	// Pointer movement callback.
	@HostListener('window:pointermove')
	public pointerMoveCallback(): void
	{
		// Reset the login timeout.
		try{ this.accountService.resetLoginTimeout(); }

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// Initializer.
	public async ngOnInit(): Promise<void>
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Web App');
		this.metadataService.setDescription('Access Hyperpass from your browser.');
		this.metadataService.setImage('web-app');

		if(this.platformService.isServer) return;

		// Otherwise, initialize.
		try
		{
			this.enableSwiping = this.platformService.isMobile;

			// Close on back button press.
			this.backButtonSubscription = this.ionicPlatform.backButton
				.subscribeWithPriority(-1, () => { App.exitApp(); });

			// If not logged in, attempt to log in with the cached login data.
			if(!this.accountService.loggedIn) await this.accountService.automaticLogIn();

			// If automatic login failed, redirect to the login page.
			if(!this.accountService.loggedIn)
			{
				this.stateService.vault = _.clone(Types.defaultVaultState);
				this.router.navigate(['/login']);
				return;
			}

			// Set the initialized flag.
			this.state = this.stateService.app;
			this.initialized = true;

			// Navigate to the cached page and route.
			this.changeDetectorRef.detectChanges();
			this.setPage(this.state.tab);

			await this.router.navigateByUrl(
				this.state.route, {skipLocationChange: true});

			// Recalculate Swiper's size.
			this.swiper?.swiperRef.updateSize();
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
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
			case 0: this.state.tab = 'Vault'; break;
			case 1: this.state.tab = 'Generator'; break;
			case 2: this.state.tab = 'Options';
		}

		this.stateService.tabSubject.next();
		this.changeDetectorRef.detectChanges();
	}


	// Navigates to the given page.
	public setPage(tab: Types.Tab): void
	{
		switch(tab)
		{
			case 'Vault': this.swiper?.swiperRef.slideTo(0); break;
			case 'Generator': this.swiper?.swiperRef.slideTo(1); break;
			case 'Options': this.swiper?.swiperRef.slideTo(2);
		}
	}
}
