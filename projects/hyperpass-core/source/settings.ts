/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


/* Settings. */
export const apiUrl = 'https://api.hyperpass.org';
export const staticUrl = 'https://static.hyperpass.org';
export const websiteUrl = 'https://hyperpass.org';

export const minimumMasterPasswordLength = 16;
export const keyLength = 32; // crypto_aead_xchacha20poly1305_ietf_KEYBYTES
export const loginTimeoutGranularity = 10000;
export const maximumHistoryEntries = 10;

export const emailAddressKey = 'Email Address';
export const masterPasswordKey = 'Master Password';
export const themeKey = 'Theme';
