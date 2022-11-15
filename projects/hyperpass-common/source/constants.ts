/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


// Values.
export const version = '2022.11.14';
export const minimumMasterPasswordLength = 12;
export const keyLength = 32; // crypto_aead_xchacha20poly1305_ietf_KEYBYTES
export const loginTimeoutGranularity = 10000;
export const maximumHistoryEntries = 10;
export const maximumVaultEntries = 10000;
export const defaultLoginTimeout = '1 Day';
export const defaultLoginTimeoutDuration = 60*24;
export const requestTimeout = 7000;


// General URLs.
export const laventhUrl = 'https://laventh.com';
export const defaultApiServer = 'https://api.hyperpass.org';
export const staticUrl = 'https://static.hyperpass.org';
export const downloadsUrl = `${staticUrl}/downloads`;
export const websiteUrl = 'https://hyperpass.org';
export const githubUrl = 'https://github.com/Myles-Trevino/Hyperpass';
export const donateUrl = 'https://www.paypal.com/donate?hosted_button_id=FADEAG6LWR23E';
export const aboutUrl = 'https://hyperpass.org/support/faq/who-is-behind-this-project';

// Extension URLs.
export const chromeExtensionUrl = 'https://chrome.google.com/webstore/detail/hyperpass/ceglgajhikekblmghjeaogljjohamcap';
export const firefoxExtensionUrl = 'https://addons.mozilla.org/en-US/firefox/addon/hyperpass';
export const edgeExtensionUrl = 'https://microsoftedge.microsoft.com/addons/detail/hyperpass/lhkmljofckjclaahcdgccbgclhcdfgdp';

// Desktop app URLs.
export const windowsUrl = `${downloadsUrl}/Hyperpass ${version}.exe`;
export const macUrl = `${downloadsUrl}/Hyperpass ${version}.pkg`;
export const linuxUrl = `${downloadsUrl}/Hyperpass ${version}.deb`;

// Mobile app URLs.
export const androidAppUrl = 'https://play.google.com/store/apps/details?id=com.laventh.hyperpass';
export const iosAppUrl = 'https://apps.apple.com/us/app/hyperpass/id1583375792';

// Support article URLs.
export const googleExportUrl = 'https://support.google.com/chrome/answer/95606';
export const firefoxExportUrl = 'https://support.mozilla.org/en-US/kb/export-login-data-firefox-lockwise';
export const bitwardenExportUrl = 'https://bitwarden.com/help/article/export-your-data';
export const lastpassExportUrl = 'https://www.theverge.com/22295354/lastpass-export-delete-bitwarden-1password-zoho';

export const supportResourcesUrl = `${staticUrl}/support`;
export const apiPackageJsonFileUrl = `${supportResourcesUrl}/package.json`;
export const apiEnvironmentVariablesFileUrl = `${supportResourcesUrl}/.env`;

export const nodeWebsiteUrl = 'https://nodejs.org';
export const mongodbUriDocumentationUrl = 'https://docs.mongodb.com/manual/reference/connection-string';
export const nginxWebsiteUrl = 'https://www.nginx.com';
export const apacheWebsiteUrl = 'https://httpd.apache.org';
export const dotenvDocumentationUrl = 'https://www.npmjs.com/package/dotenv';
export const mongodbSetupGuideUrl = 'https://docs.mongodb.com/manual/administration/install-community';
export const serverSetupGuideUrl = 'https://www.digitalocean.com/community/tutorial_collections/initial-server-setup';
export const pm2WebsiteUrl = 'https://pm2.keymetrics.io';

// Cache keys.
export const apiServerKey = 'API Server';
export const deviceIdKey = 'Device ID';
export const emailAddressKey = 'Email Address';
export const masterPasswordKey = 'Master Password';
export const vaultKey = 'Vault';
export const loginTimeoutKey = 'Login Timeout';
export const themeKey = 'Theme';
export const stateKey = 'State';
