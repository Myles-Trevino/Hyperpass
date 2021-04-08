/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, OnDestroy} from '@angular/core';
import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';

import {MetadataService} from 'hyperpass-core';


@Component
({
	selector: 'hyperpass-not-found',
	templateUrl: './not-found.component.html',
	styleUrls: ['./not-found.component.scss']
})

export class NotFoundComponent implements OnInit, OnDestroy
{
	private static readonly countdownDuration = 10;

	@HostBinding('class') protected readonly class = 'centerer-page';

	public secondsRemaining = NotFoundComponent.countdownDuration;
	private redirectInterval?: NodeJS.Timeout;


	// Constructor.
	public constructor(private readonly router: Router,
		private readonly metadataService: MetadataService){}


	// Initializer.
	public ngOnInit(): void
	{
		this.redirect();
		this.metadataService.clear();
		this.metadataService.setTitle('Not Found');
		this.metadataService.setDescription('The requested '+
			'page or resource couldn\'t be found.');
		this.metadataService.setImage('not-found');
	}


	// Destructor.
	public ngOnDestroy(): void
	{ if(this.redirectInterval) clearInterval(this.redirectInterval); }


	// Redirects to the index page when the time has elapsed.
	private redirect(): void
	{
		this.redirectInterval = setInterval(() =>
		{
			--this.secondsRemaining;
			if(this.secondsRemaining <= 0)
			{
				this.router.navigate(['/']);
				if(this.redirectInterval) clearInterval(this.redirectInterval);
			}
		}, 1000);
	}
}
