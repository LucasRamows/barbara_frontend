import fs from 'fs';

const documentCryptoContent = `import * as crypto from 'crypto';
import { DocumentType } from '@prisma/client';
import { normalizeDocument, isValidDocument } from './identity-audit';

const DEFAULT_HASH_PEPPER = process.env.DOCUMENT_HASH_PEPPER ?? 'barbara-document-pepper-fixed-seed-32b!';
const DEFAULT_KEY_VERSION = 1;

/**
 * Key registry supporting versioned rotation.
 * Keys must be 32 bytes (256 bits).
 */
const DEFAULT_KEYS: Record<number, Buffer> = {
  1: crypto.createHash('sha256').update(process.env.DOCUMENT_ENCRYPTION_KEY ?? 'barbara-document-enc-key-v1-default').digest(),
  2: crypto.createHash('sha256').update(process.env.DOCUMENT_ENCRYPTION_KEY_V2 ?? 'barbara-document-enc-key-v2-secondary').digest(),
};

export class DocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentValidationError';
  }
}

/**
 * Validates check digits and determines document type (CPF vs CNPJ).
 */
export function validateAndClassifyDocument(raw: string): {
  normalized: string;
  type: DocumentType;
  last4: string;
} {
  const normalized = normalizeDocument(raw);
  if (!isValidDocument(normalized)) {
    throw new DocumentValidationError('Documento inválido: CPF ou CNPJ com dígitos verificadores incorretos.');
  }

  const type = normalized.length === 11 ? DocumentType.CPF : DocumentType.CNPJ;
  const last4 = normalized.slice(-4);

  return { normalized, type, last4 };
}

/**
 * Generates an HMAC-SHA256 blind-index hash for fast, privacy-preserving uniqueness lookups.
 */
export function hashDocument(normalized: string, pepper = DEFAULT_HASH_PEPPER): string {
  return crypto.createHmac('sha256', pepper).update(normalized).digest('hex');
}

/**
 * Encrypts document using AES-256-GCM with authenticated tag.
 * Returns iv:ciphertext:tag string.
 */
export function encryptDocument(
  normalized: string,
  keyVersion = DEFAULT_KEY_VERSION,
  keys = DEFAULT_KEYS,
): { encrypted: string; keyVersion: number } {
  const key = keys[keyVersion];
  if (!key) {
    throw new Error(\`Encryption key version \${keyVersion} not configured\`);
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(normalized, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const encrypted = \`\${iv.toString('hex')}:\${ciphertext.toString('hex')}:\${tag.toString('hex')}\`;
  return { encrypted, keyVersion };
}

/**
 * Decrypts an AES-256-GCM ciphertext using the designated key version.
 */
export function decryptDocument(
  encrypted: string,
  keyVersion: number,
  keys = DEFAULT_KEYS,
): string {
  const key = keys[keyVersion];
  if (!key) {
    throw new Error(\`Decryption key version \${keyVersion} not found\`);
  }

  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, ciphertextHex, tagHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Rotates an encrypted document to a new key version without exposing plaintext.
 */
export function rotateDocument(
  encrypted: string,
  currentVersion: number,
  newVersion: number,
  keys = DEFAULT_KEYS,
): { encrypted: string; keyVersion: number } {
  const plaintext = decryptDocument(encrypted, currentVersion, keys);
  return encryptDocument(plaintext, newVersion, keys);
}

/**
 * Produces a user-facing masked representation of a CPF or CNPJ.
 * CPF: ***.***.890-12
 * CNPJ: **.***.***/0001-90
 */
export function maskDocument(normalized: string, type: DocumentType): string {
  if (type === DocumentType.CPF && normalized.length === 11) {
    return \`***.***.\${normalized.slice(6, 9)}-\${normalized.slice(9, 11)}\`;
  }
  if (type === DocumentType.CNPJ && normalized.length === 14) {
    return \`**.***.***/\${normalized.slice(8, 12)}-\${normalized.slice(12, 14)}\`;
  }
  return \`***\${normalized.slice(-4)}\`;
}

/**
 * Returns a masked preview using only last 4 digits when full doc is not available.
 */
export function maskFromLast4(last4: string, type: DocumentType): string {
  if (type === DocumentType.CPF) {
    return \`***.***.\${last4.slice(0, 2)}-\${last4.slice(2, 4)}\`;
  }
  return \`**.***.***/\${last4.slice(0, 2)}-\${last4.slice(2, 4)}\`;
}
`;

const phoneNormalizerContent = `/**
 * Normalizes Brazilian phone numbers by removing non-digits.
 * Validates standard 10-digit (landline with DDD) or 11-digit (mobile with DDD) format.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return null;
  }
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

export function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return \`(\${digits.slice(0, 2)}) \${digits.slice(2, 7)}-\${digits.slice(7)}\`;
  }
  if (digits.length === 10) {
    return \`(\${digits.slice(0, 2)}) \${digits.slice(2, 6)}-\${digits.slice(6)}\`;
  }
  return digits;
}
`;

fs.writeFileSync('d:/Trabalho/Projetos/barbaraBackend/src/identity/document-crypto.ts', documentCryptoContent, 'utf8');
console.log('Created document-crypto.ts');

fs.writeFileSync('d:/Trabalho/Projetos/barbaraBackend/src/identity/phone-normalizer.ts', phoneNormalizerContent, 'utf8');
console.log('Created phone-normalizer.ts');
