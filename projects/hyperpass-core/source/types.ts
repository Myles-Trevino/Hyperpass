/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


// State.
export type ScrollState = {scrollPosition: number};

export const defaultScrollState = {scrollPosition: 0};


export type VaultState = ScrollState &
{
	page: number;
	query: string;
};

export const defaultVaultState: VaultState =
	{...defaultScrollState, page: 1, query: ''};


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
export const vaultEntryTypes = ['Account', 'Card', 'Note'] as const;

export type VaultEntryType = typeof vaultEntryTypes[number];


export const tagColors = ['Red', 'Orange', 'Yellow',
	'Green', 'Cyan', 'Blue', 'Purple', 'Pink', 'None'] as const;

export type TagColor = typeof tagColors[number];

export type Tag = { color: TagColor };

export const defaultTag: Tag = {color: 'None'};

export const reservedTags = ['Account', 'Card', 'Note'];


export type InputHistoryEntry =
{
	date: Date;
	entry: string;
};


export type VaultEntry =
{
	note: string;
	noteHistory: InputHistoryEntry[];
	tags: string[];
};

export const defaultVaultEntry = {note: '', noteHistory: [], tags: []};


export type Account = VaultEntry &
{
	username: string;
	usernameHistory: InputHistoryEntry[];
	password: string;
	passwordHistory: InputHistoryEntry[];
	url: string;
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
	tags: ['Account']
};

export function areAccountsEqual(a: Account, b: Account): boolean
{ return checkEquality(a, b, ['username', 'password', 'url', 'note']); }


export type Card = VaultEntry &
{
	holder: string;
	cardNumber: string;
	expirationDate: string;
	securityCode: string;
};

export const defaultCard: Card =
{
	holder: '',
	cardNumber: '',
	expirationDate: '',
	securityCode: '',
	note: '',
	noteHistory: [],
	tags: ['Card']
};


export type Note = VaultEntry;

export const defaultNote: Note = {note: '', noteHistory: [], tags: ['Note']};


// Vault.
export type VaultHistoryEntry =
{
	type: VaultEntryType;
	date: Date;
	key: string;
	entry: Account|Card|Note;
};


export type Vault =
{
	accounts: Record<string, Account>;
	cards: Record<string, Card>;
	notes: Record<string, Note>;
	tags: Record<string, Tag>;
	history: VaultHistoryEntry[];
	settings: Settings;
	generatorState: GeneratorState;
};

export const defaultVault: Vault =
{
	accounts: {},
	cards: {},
	notes: {},
	history: [],
	tags: {'Account': defaultTag, 'Card': defaultTag, 'Note': defaultTag},
	settings: defaultSettings,
	generatorState: defaultGeneratorState
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
