/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


import {Injectable} from '@angular/core';
import * as Sodium from 'libsodium-wrappers';
import {argon2id} from 'hash-wasm';
import * as Fflate from 'fflate';

import type * as Types from '../types';
import * as Constants from '../constants';


@Injectable({providedIn: 'root'})

export class CryptoService
{
	// Initializer.
	public async initialize(): Promise<void> { await Sodium.ready; }


	// Generates a random 32-bit unsigned integer.
	public randomInt(minimum: number, maximum: number): number
	{
		if(minimum > maximum) throw new Error('Minimum must be less than maximum.');
		if(minimum === maximum) return minimum;

		const randomUInt32 = new DataView(
			Sodium.randombytes_buf(4).buffer, 0).getUint32(0, true);

		return Math.floor(((randomUInt32/0xFFFFFFFF)*(maximum-minimum+1))+minimum);
	}


	// Converts the given data to a base64-encoded string.
	public toString(data: Uint8Array): string
	{ return Sodium.to_base64(data, Sodium.base64_variants.ORIGINAL); }


	// Converts the given base64-encoded string to bytes.
	public toBytes(data: string): Uint8Array
	{ return Sodium.from_base64(data, Sodium.base64_variants.ORIGINAL); }


	// Generates a random string of the given number of bytes.
	public randomBytes(bytes: number): string
	{ return this.toString(Sodium.randombytes_buf(bytes)); }


	// Derives an XChaCha20-Poly1305 key from the given master password using Argon2id.
	public async deriveKey(masterPassword: string,
		encryptedData?: Types.EncryptedData): Promise<Types.Key>
	{
		// Generate the salt if none was provided.
		let salt = encryptedData?.salt ? this.toBytes(encryptedData.salt) : undefined;
		if(!salt) salt = Sodium.randombytes_buf(Sodium.crypto_pwhash_SALTBYTES);

		// Hash the given password using Argon2id.
		const key = await argon2id
		({
			password: masterPassword,
			salt,
			parallelism: 1,
			iterations: 256,
			memorySize: 512, // KiB.
			hashLength: Sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
			outputType: 'binary'
		});

		return {key, salt};
	}


	// Encrypts the given plaintext with the given key using XChaCha20-Poly1305.
	public encrypt(plaintext: string, key: Types.Key): Types.EncryptedData
	{
		// Generate the nonce.
		const nonce = Sodium.randombytes_buf(
			Sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

		// Encrypt the data using XChaCha20-Poly1305.
		const ciphertext = Sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
			plaintext, null, null, nonce, key.key);

		// Return.
		return {
			ciphertext: this.toString(ciphertext),
			nonce: this.toString(nonce),
			salt: key.salt ? this.toString(key.salt) : undefined
		};
	}


	// Decrypts the given ciphertext with the given nonce and key using XChaCha20-Poly1305.
	public decrypt(encryptedData: Types.EncryptedData, key: Types.Key): string
	{
		try
		{
			// Decrypt using XChaCha20-Poly1305.
			const decryptedData = Sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
				null, this.toBytes(encryptedData.ciphertext), null,
				this.toBytes(encryptedData.nonce), key.key);

			// Return.
			return Sodium.to_string(decryptedData);
		}

		catch(error: unknown){ throw new Error('Invalid credentials.'); }
	}


	// Encrypts and compresses the given plaintext with the given derived key.
	public compressAndEncrypt(plaintext: string, key: Types.Key): Types.EncryptedData
	{
		const compressedPlaintext = Fflate.compressSync(Fflate.strToU8(plaintext));
		return this.encrypt(this.toString(compressedPlaintext), key);
	}


	// Decrypts and decompresses the given ciphertext.
	public decryptAndDecompress(encryptedData: Types.EncryptedData,
		key: Types.Key): string
	{
		const compressedPlaintext = this.decrypt(encryptedData, key);
		return Fflate.strFromU8(Fflate.decompressSync(this.toBytes(compressedPlaintext)));
	}


	// Generates an encrypted key with the given master password.
	public async generateEncryptedKey(masterPassword: string): Promise<Types.EncryptedKey>
	{
		const value = this.randomBytes(Constants.keyLength);
		const key = await this.deriveKey(masterPassword);
		const encrypted = this.encrypt(value, key);
		return {value, encrypted};
	}
}
