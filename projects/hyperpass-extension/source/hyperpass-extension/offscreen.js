setInterval(async () => {
	(await navigator.serviceWorker.ready).active.postMessage('persist');
}, 5000);