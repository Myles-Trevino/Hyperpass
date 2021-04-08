/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Subject} from 'rxjs';


// State.
export type ScrollState = {scrollPosition: number};

export const defaultScrollState = {scrollPosition: 0};


export type VaultState = ScrollState &
{
	page: number;
	query?: string;
};

export const defaultVaultState: VaultState =
	{...defaultScrollState, page: 1, query: ''};


export type TagsModalEvent =
{
	type: 'Select'|'Delete';
	tag: string;
};

export type TagsModalState =
{
	subject: Subject<TagsModalEvent>;
	singleEditTag?: string;
};

export const defaultTagsModalState: TagsModalState =
{
	subject: new Subject<TagsModalEvent>(),
	singleEditTag: undefined
};


export type VaultHistoryModalState =
{
	subject: Subject<void>;
	history: VaultHistoryEntry[];
};

export const defaultVaultHistoryModalState: VaultHistoryModalState =
{
	subject: new Subject<void>(),
	history: []
};


export type VaultEntryHistoryModalState =
{
	subject: Subject<VaultEntryHistoryEntry[]>;
	history: VaultEntryHistoryEntry[];
};

export const defaultVaultEntryHistoryModalState: VaultEntryHistoryModalState =
{
	subject: new Subject<VaultEntryHistoryEntry[]>(),
	history: []
};


// Message.
export type MessageType = 'Normal'|'Error';

export type MessageData =
{
	message: string;
	type: MessageType;
	duration: number;
};


// Encryption.
export type Key =
{
	key: Uint8Array;
	salt?: Uint8Array;
};

export type EncryptedData =
{
	ciphertext: string;
	nonce: string;
	salt?: string;
};


// Account.
export type PublicAccountInformation =
{
	validated: boolean;
	automaticLoginKey: string;
	encryptedAccessKey: EncryptedData;
};

export type EncryptedKey =
{
	value: string;
	encrypted: EncryptedData;
};

export type AccessData =
{
	emailAddress: string;
	accessKey: string;
};


// Settings.
export const themes = ['Light', 'Dark'] as const;

export type Theme = typeof themes[number];

export const isTheme = (value: string): value is Theme =>
	themes.includes(value as Theme);


export const loginTimeouts = ['Never', '5 Minutes', '15 Minutes', '30 Minutes'] as const;

export type LoginTimeout = typeof loginTimeouts[number];


export type Settings =
{
	theme: Theme;
	loginTimeout: LoginTimeout;
};

export const defaultSettings: Settings =
{
	theme: 'Light',
	loginTimeout: 'Never'
};


// Generator state.
export type GeneratorHistoryEntry =
{
	date: Date;
	password: string;
};

export const generatorModes = ['Passphrase', 'Password'] as const;

export type GeneratorMode = typeof generatorModes[number];

export type GeneratorState =
{
	mode: GeneratorMode;

	wordCount: number;
	numberCount: number;
	separator: string;
	capitalize: boolean;

	length: number;
	useSpecialCharacters: boolean;
	useNumbers: boolean;
	useCapitals: boolean;

	history: GeneratorHistoryEntry[];
};

export const defaultGeneratorState: GeneratorState =
{
	mode: 'Passphrase',

	wordCount: 3,
	numberCount: 2,
	separator: '-',
	capitalize: true,

	length: 16,
	useSpecialCharacters: true,
	useNumbers: true,
	useCapitals: true,

	history: []
};


// Vault entries.
export const tagColors = ['Red', 'Orange', 'Yellow',
	'Green', 'Cyan', 'Blue', 'Purple', 'Pink', 'None'] as const;

export type TagColor = typeof tagColors[number];

export type Tag =
{
	name: string;
	color: TagColor;
};

export const defaultTag: Tag =
{
	name: '',
	color: 'None'
};


export type VaultEntryHistoryEntry =
{
	date: Date;
	entry: string;
};


export type Account =
{
	username: string;
	usernameHistory: VaultEntryHistoryEntry[];
	password: string;
	passwordHistory: VaultEntryHistoryEntry[];
	url: string;
	note: string;
	noteHistory: VaultEntryHistoryEntry[];
	tags: string[];
	default: boolean;
};

export const defaultAccount: Account =
{
	username: '',
	usernameHistory: [],
	password: '',
	passwordHistory: [],
	url: '',
	default: false,
	note: '',
	noteHistory: [],
	tags: []
};

export function areAccountsEqual(a: Account, b: Account): boolean
{ return checkEquality(a, b, ['username', 'password', 'url', 'note']); }


// Vault.
export type VaultHistoryEntry =
{
	date: Date;
	key: string;
	value: Account;
};


export type Vault =
{
	accounts: Record<string, Account>;
	tags: Record<string, Tag>;
	history: VaultHistoryEntry[];
	settings: Settings;
	generatorState: GeneratorState;
};

export const defaultVault: Vault =
{
	accounts: {},
	history: [],
	tags: {},
	settings: defaultSettings,
	generatorState: defaultGeneratorState
};


export const queryModifiers = ['username:', 'url:', 'tag:'] as const;

export type QueryModifier = typeof queryModifiers[number];

export type QueryPart =
{
	modifier?: QueryModifier;
	string: string;
};


// Import and export.
export const importFormats =
[
	'HY Encrypted',
	'HY Unencrypted',
	'Google',
	'Firefox',
	'Bitwarden',
	'LastPass'
] as const;

export type ImportFormat = typeof importFormats[number];


export const trimModes = ['Enabled', 'Disabled'] as const;

export type TrimMode = typeof trimModes[number];


export const importModes = ['Append', 'Merge', 'Overwrite'] as const;

export type ImportMode = typeof importModes[number];


export const exportFormats = ['HY Encrypted', 'HY Unencrypted'] as const;

export type ExportFormat = typeof exportFormats[number];


// Messages.
export type Message =
{
	type: string;
	data: unknown;
};


// Helpers.
function checkEquality<T>(a: T, b: T, keys: (keyof T)[]): boolean
{
	for(const key of keys) if(a[key] !== b[key]) return false;
	return true;
}
