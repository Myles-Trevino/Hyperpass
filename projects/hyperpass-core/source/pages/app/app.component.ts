/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {AfterContentInit, OnDestroy, OnInit} from '@angular/core';
import {ElementRef, Component, HostBinding, HostListener,
	ViewChild, ChangeDetectorRef} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {NgIf, NgClass} from '@angular/common';
import SwiperCore, {EffectFade} from 'swiper';
import {SwiperComponent, SwiperModule} from 'swiper/angular';
import type {Subscription} from 'rxjs';
import {App} from '@capacitor/app';
import * as Ionic from '@ionic/angular';
import * as _ from 'lodash';

import {Types, Constants, Utilities} from 'builds/hyperpass-common';

import * as Animations from '../../animations';
import {AccountService} from '../../services/account.service';
import {StateService} from '../../services/state.service';
import {VaultComponent} from '../../pages/app/vault/vault.component';
import {PlatformService} from '../../services/platform.service';
import {MetadataService} from '../../services/metadata.service';
import {MessageService} from '../../services/message.service';
import {InitializationService} from '../../services/initialization.service';
import {StorageService} from '../../services/storage.service';
import {GeneratorComponent} from './generator/generator.component';
import {TagsModalComponent} from './tags-modal/tags-modal.component';
import {VaultEntryHistoryModalComponent} from './history-modal/vault-entry-history-modal/vault-entry-history-modal.component';
import {VaultHistoryModalComponent} from './history-modal/vault-history-modal/vault-history-modal.component';


SwiperCore.use([EffectFade]);


@Component
({
	selector: 'hyperpass-app',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [Animations.fadeAnimation, Animations.delayedFadeAnimation],
	imports: [NgIf, Ionic.IonicModule, NgClass, SwiperModule, RouterOutlet, GeneratorComponent, TagsModalComponent, VaultEntryHistoryModalComponent, VaultHistoryModalComponent]
})

export class AppComponent implements OnInit, OnDestroy, AfterContentInit
{
	@HostBinding('class') public readonly class = 'centerer-page';
	@ViewChild('modalOverlay') private readonly modalOverlay?: ElementRef;
	@ViewChild('swiper') private readonly swiper?: SwiperComponent;

	public state: Types.AppState = _.clone(Types.defaultAppState);
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
		private readonly storageService: StorageService,
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
		// Set the metadata.
		this.metadataService.clear();
		this.metadataService.setTitle('Web App');
		this.metadataService.setDescription('Access Hyperpass from your browser.');
		this.metadataService.setImage('web-app');

		// Do not initialize the app if this is the server.
		if(this.platformService.isServer) return;

		// Otherwise, initialize.
		try
		{
			this.enableSwiping = this.platformService.isMobileApp;

			// Close on back button press.
			this.backButtonSubscription = this.ionicPlatform.backButton
				.subscribeWithPriority(-1, () => { App.exitApp(); });

			// If not logged in...
			if(!this.accountService.loggedIn)
			{
				// If online, attempt to log in with the cached login data.
				if(this.stateService.isOnline) await this.accountService.automaticLogIn();

				// If offline, check if there is cached email address and vault data.
				else
				{
					// If not, return with an error notification
					// and redirect to the login page.
					if(!await this.storageService.getData(Constants.emailAddressKey) ||
						!await this.storageService.getData(Constants.vaultKey))
					{
						this.messageService.error(new Error('Could not connect to the API. '+
							'No offline vault was found, so you must reconnect to login.'), 0);
						this.router.navigate(['/login']);
						return;
					}

					// Otherwise display an "offline mode" notification and continue.
					this.messageService.error(new Error('Could not connect to the API. '+
						'Launching in offline mode using your last synced vault. '+
						'Functionality will be limited.'), 0);
				}

				// If automatic login failed, redirect to the login page.
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if(!this.accountService.loggedIn)
				{
					this.stateService.vault = _.clone(Types.defaultVaultState);
					this.router.navigate(['/login']);
					return;
				}
			}

			// Set the initialized flag.
			this.state = this.stateService.app;
			this.stateService.initialized = true;

			// Navigate to the cached tab and route.
			this.changeDetectorRef.detectChanges();
			this.setTab(this.state.tab);
			await this.router.navigateByUrl(this.state.route, {skipLocationChange: true});
		}

		// Handle errors.
		catch(error: unknown){ this.messageService.error(error as Error); }
	}


	// After the content has been initialized...
	public async ngAfterContentInit(): Promise<void>
	{
		// Recalculate Swiper's size.
		await Utilities.sleep();

		if(this.swiper && this.swiper.isSwiperActive)
			this.swiper.swiperRef.update();
	}


	// Destructor.
	public ngOnDestroy(): void { this.backButtonSubscription?.unsubscribe(); }


	// Closes the modal if the modal overlay was clicked.
	public closeModal(event: MouseEvent): void
	{
		if(event.target === this.modalOverlay?.nativeElement)
			this.stateService.closeModals();
	}


	// Tab navigation callback.
	public tabChangeCallback(): void
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


	// Navigates to the given tab.
	public setTab(tab: Types.Tab): void
	{
		switch(tab)
		{
			case 'Vault': this.swiper?.swiperRef.slideTo(0); break;
			case 'Generator': this.swiper?.swiperRef.slideTo(1); break;
			case 'Options': this.swiper?.swiperRef.slideTo(2);
		}
	}
}
