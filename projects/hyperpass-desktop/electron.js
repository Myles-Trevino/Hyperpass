/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


const Electron = require('electron');


let window;


// Hide the application menu.
Electron.Menu.setApplicationMenu(null);


// Initializes the application.
Electron.app.whenReady().then(createWindow);

function createWindow()
{
	// Create the window.
	window = new Electron.BrowserWindow
	({
		width: 1200,
		height: 730,
		minWidth: 940,
		minHeight: 730,
		frame: false,
		backgroundColor: 'black',
		show: false,
		webPreferences:
		{
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	// Load the page.
	window.loadFile(`${__dirname}../../../builds/hyperpass-desktop/build/index.html`);

	// Show Chrome developer tools.
	// window.webContents.openDevTools();

	// Open new tab links in the browser.
	window.webContents.setWindowOpenHandler((event, url) =>
	{
		event.preventDefault();
		Electron.shell.openExternal(url);
	});
}


// Show the window.
Electron.ipcMain.on('show-window', () => window.show());


// Window controls.
Electron.ipcMain.on('minimize', () => window.minimize());

Electron.ipcMain.on('maximize', () =>
{
	// Go fullscreen on MacOS.
	if(process.platform === 'darwin')
	{
		if(!window.isFullScreen()) window.setFullScreen(true);
		else window.setFullScreen(false);
	}

	// Maximize on Windows and Linux.
	else
	{
		if(!window.isMaximized()) window.maximize();
		else window.unmaximize();
	}
});

Electron.ipcMain.on('close', () => window.close());


// Close the process when all windows have been exited.
Electron.app.on('window-all-closed', () => { Electron.app.quit(); });
