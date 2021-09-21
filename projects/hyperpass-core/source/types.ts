/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


// App.
export type Tab = 'Vault'|'Generator'|'Options';


// State.
export type ScrollState = {scrollPosition: number};

export const defaultScrollState = {scrollPosition: 0};


export type VaultState = ScrollState &
{
	page: number;
	query?: string;
};

export const defaultVaultState: VaultState = {...defaultScrollState, page: 1, query: ''};


export const generatorModes = ['Passphrase', 'Password'] as const;

export type GeneratorMode = typeof generatorModes[number];

export type GeneratorSyncedState =
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
};

export const defaultGeneratorSyncedState: GeneratorSyncedState =
{
	mode: 'Passphrase',

	wordCount: 3,
	numberCount: 2,
	separator: '-',
	capitalize: true,

	length: 16,
	useSpecialCharacters: true,
	useNumbers: true,
	useCapitals: true
};


export type AppState =
{
	tab: Tab;
	route: string;
	modalOpen: boolean;
	modalType?: string;
};

export const defaultAppState: AppState =
{
	tab: 'Vault',
	route: '/app',
	modalOpen: false
};


export type VaultEntryState = Account & ScrollState & {key?: string; title: string};

export const defaultVaultEntryState = {...defaultScrollState, title: '',
	username: '', usernameHistory: [], password: '', passwordHistory: [],
	url: '', default: false, note: '', noteHistory: [], tags: []};


export type ImportVaultState = ScrollState &
{
	format: ImportFormat;
	trim: TrimMode;
	mode: ImportMode;
};

export const defaultImportVaultState: ImportVaultState =
{
	...defaultScrollState,
	format: 'HY Encrypted',
	trim: 'Enabled',
	mode: 'Merge'
};


export type ExportVaultState = ScrollState & {format: ExportFormat};

export const defaultExportVaultState: ExportVaultState =
{
	...defaultScrollState,
	format: 'HY Encrypted'
};


export type TagsModalEvent =
{
	type: 'Select'|'Delete';
	tag: string;
};

export type TagsModalState = ScrollState & {singleEditTag?: string};

export const defaultTagsModalState: TagsModalState =
{
	...defaultScrollState,
	singleEditTag: undefined
};


export type VaultHistoryModalState = ScrollState & {history: VaultHistoryEntry[]};

export const defaultVaultHistoryModalState: VaultHistoryModalState =
{
	...defaultScrollState,
	history: []
};


export type VaultEntryHistoryModalState = ScrollState &
{
	history: VaultEntryHistoryEntry[];
};

export const defaultVaultEntryHistoryModalState: VaultEntryHistoryModalState =
{
	...defaultScrollState,
	history: []
};


export type CachedState =
{
	vault: VaultState;
	generator: ScrollState;
	options: ScrollState;
	app: AppState;

	vaultEntry?: VaultEntryState;

	importVault: ImportVaultState;
	exportVault: ExportVaultState;

	tagsModal: TagsModalState;
	vaultHistoryModal: VaultHistoryModalState;
	vaultEntryHistoryModal: VaultEntryHistoryModalState;
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

export type LoginCredentials =
{
	emailAddress: string;
	masterPassword: string;
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


export const loginTimeouts = ['5 Minutes', '1 Hour', '1 Day', '1 Week'] as const;

export type LoginTimeout = typeof loginTimeouts[number];


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

export const defaultAccount: Account = {username: '', usernameHistory: [], password: '',
	passwordHistory: [], url: '', default: false, note: '', noteHistory: [], tags: []};

export function areAccountsEqual(a: Account, b: Account): boolean
{ return checkEquality(a, b, ['username', 'password', 'url', 'note']); }

export type AccountEntry = Account & {key: string};


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
	generatorState: GeneratorSyncedState;
};

export const defaultVault: Vault =
{
	accounts: {},
	history: [],
	tags: {},
	generatorState: defaultGeneratorSyncedState
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
	'Google CSV',
	'Firefox CSV',
	'Bitwarden CSV',
	'LastPass CSV'
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
