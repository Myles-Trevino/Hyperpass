/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


export const apiUrl = 'https://api.hyperpass.org';
export const staticUrl = 'https://static.hyperpass.org';
export const websiteUrl = 'https://hyperpass.org';
export const donateUrl = 'https://www.paypal.com/donate?hosted_button_id=FADEAG6LWR23E';

export const version = '2021.7.21';
export const minimumMasterPasswordLength = 12;
export const keyLength = 32; // crypto_aead_xchacha20poly1305_ietf_KEYBYTES
export const loginTimeoutGranularity = 10000;
export const maximumHistoryEntries = 10;
export const maximumVaultEntries = 10000;
export const defaultLoginTimeout = '1 Day';
export const defaultLoginTimeoutDuration = 60*24;

export const deviceIdKey = 'Device ID';
export const emailAddressKey = 'Email Address';
export const masterPasswordKey = 'Master Password';
export const loginTimeoutKey = 'Login Timeout';
export const themeKey = 'Theme';
export const stateKey = 'State';
