async function createOffscreenDocument() {
	await chrome.offscreen.createDocument({
		url: 'offscreen.html',
		reasons: ['BLOBS'],
		justification: 'Persist service worker.',
	});
}

try {
	// Persist the service worker.
	chrome.runtime.onStartup.addListener(createOffscreenDocument);
	self.onmessage = (e) => { console.log('Persist event.'); };
	createOffscreenDocument();

	// Import main scripts.
	importScripts('service-worker.js', 'runtime.js');
} catch (error) {
	console.log(error);
}