/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnDestroy, OnInit} from '@angular/core';
import {Component} from '@angular/core';
import type {Subscription} from 'rxjs';

import type * as Types from '../types';
import {MessageService} from '../services/message.service';
import {PlatformService} from '../services/platform.service';
import {UtilityService} from '../services/utility.service';


@Component
({
	selector: 'hyperpass-message',
	templateUrl: './message.component.html',
	styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit, OnDestroy
{
	private readonly cssUpdateDuration = 17;
	private readonly transitionDuration = 160;

	public message = '';
	public type = 'normal';
	public visible = false;

	private subscription?: Subscription;
	private duration = 0;
	private timeout?: NodeJS.Timeout;


	// Constructor.
	public constructor(private readonly utilityService: UtilityService,
		private readonly platformService: PlatformService,
		private readonly messageService: MessageService){}


	// Initializer.
	public ngOnInit(): void
	{
		if(this.platformService.isServer()) return;

		this.subscription = this.messageService.messages.asObservable()
			.subscribe((messageData) => { this.messageCallback(messageData); });
	}


	// Destructor.
	public ngOnDestroy(): void { this.subscription?.unsubscribe(); }


	// Closes the message.
	public close(): void { this.visible = false; }


	// Message callback.
	private async messageCallback(messageData: Types.MessageData): Promise<void>
	{
		const wasVisible = this.visible;
		this.visible = false;
		if(wasVisible) await this.utilityService.sleep(this.transitionDuration);

		this.message = messageData.message;
		this.duration = messageData.duration*1000;
		this.type = messageData.type;
		await this.utilityService.sleep(this.cssUpdateDuration);
		this.visible = true;

		if(this.timeout)
		{
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}

		if(this.duration > 0)
			this.timeout = setTimeout(() => { this.close(); }, this.duration);
	}
}
