/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import type {OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {Component, HostBinding, ViewChild, ElementRef} from '@angular/core';
import * as Three from 'three';

import {Constants} from 'builds/hyperpass-common';
import {MetadataService, PlatformService, ThemeService, Animations} from 'hyperpass-core';


type Point =
{
	pivot: Three.Group;
	mesh: Three.Mesh;
	speed: number;
};


@Component
({
	selector: 'hyperpass-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss'],
	animations: [Animations.initialFadeInAnimation]
})

export class IndexComponent implements OnInit, AfterViewInit, OnDestroy
{
	@HostBinding('class') protected readonly class = 'page';
	@ViewChild('canvas') private readonly canvas?: ElementRef;

	public showCanvas = false;
	public readonly constants = Constants;
	private readonly fov = 80;
	private readonly pointCount = 1000;
	private readonly pointSize = 0.033;
	private readonly pointResolution = 5;
	private readonly minimumSpeed = 0.001;
	private readonly maximumSpeed = 5;
	private readonly spread = 100;
	private readonly minimumDistance = 10;
	private renderer?: Three.WebGLRenderer;
	private camera?: Three.PerspectiveCamera;
	private scene?: Three.Scene;
	private previousTime = 0;
	private readonly points: Point[] = [];


	// Constructor.
	public constructor(private readonly metadataService: MetadataService,
		private readonly themeService: ThemeService,
		private readonly platformService: PlatformService){}


	// Initializer.
	public ngOnInit(): void
	{
		// Metadata.
		this.metadataService.clear();
		this.metadataService.setTitle();
		this.metadataService.setDescription('A modern, unified password manager.');
		this.metadataService.setImage('hyperpass');
	}


	// Initializes Three.js.
	public ngAfterViewInit(): void
	{
		if(this.platformService.isServer) return;
		if(!this.canvas) throw new Error('No canvas.');

		// Initialize Three.js.
		this.renderer = new Three.WebGLRenderer
		({
			canvas: this.canvas.nativeElement as HTMLCanvasElement,
			alpha: true,
			antialias: true
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.camera = new Three.PerspectiveCamera(this.fov, 1, 0.1, 100);
		this.scene = new Three.Scene();

		// Generate the points.
		const pointColor = (this.themeService.theme === 'Dark') ?
			'rgb(211, 221, 237)' : 'rgb(49, 57, 74)';

		for(let index = 0; index < this.pointCount;)
		{
			const pivot = new Three.Group();

			const geometry = new Three.SphereBufferGeometry(this.pointSize,
				this.pointResolution, this.pointResolution);

			const material = new Three.MeshBasicMaterial({color: pointColor});
			const mesh = new Three.Mesh(geometry, material);

			mesh.position.set
			(
				Three.MathUtils.randFloatSpread(this.spread),
				Three.MathUtils.randFloatSpread(this.spread),
				Three.MathUtils.randFloatSpread(this.spread)
			);

			const distance = mesh.position.distanceTo(new Three.Vector3(0, 0, 0));
			if(distance < this.minimumDistance) continue;

			this.points.push({pivot, mesh, speed: Three.MathUtils.mapLinear(distance,
				this.minimumDistance, this.spread, this.maximumSpeed, this.minimumSpeed)});

			pivot.add(mesh);
			this.scene.add(pivot);

			++index;
		}

		// Add the window resize callback.
		window.addEventListener('resize', () => { this.onWindowResize(); }, false);
		this.onWindowResize();

		// Start the render loop.
		this.render();
	}


	// Destructor.
	public ngOnDestroy(): void
	{
		this.renderer?.dispose();
		this.renderer = undefined;
	}


	// Window resize callback.
	private onWindowResize(): void
	{
		if(!this.camera || !this.renderer) return;
		this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}


	// Render.
	private render(): void
	{
		if(!this.renderer || !this.camera || !this.scene) return;

		// Time.
		const time = performance.now();
		const delta = (time-this.previousTime)/1000;
		this.previousTime = time;

		// Rotate points.
		for(const point of this.points)
			point.pivot.rotateY(-Three.MathUtils.degToRad(delta*point.speed));

		// Render.
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => { this.render(); });
		if(!this.showCanvas) setTimeout(() => { this.showCanvas = true; }, 500);
	}
}
