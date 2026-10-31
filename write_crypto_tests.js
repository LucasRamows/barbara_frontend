import fs from 'fs';

const cryptoSpec = `import { DocumentType } from '@prisma/client';
import {
  validateAndClassifyDocument,
  hashDocument,
  encryptDocument,
  decryptDocument,
  rotateDocument,
  maskDocument,
  maskFromLast4,
  DocumentValidationError,
} from './document-crypto';

describe('DocumentCrypto', () => {
  // Valid fixtures (generated valid CPF and CNPJ)
  const validCpf = '52998224725';
  const validCnpj = '11222333000181';

  describe('validateAndClassifyDocument', () => {
    it('validates and classifies a valid CPF with formatting', () => {
      const result = validateAndClassifyDocument('529.982.247-25');
      expect(result.normalized).toBe('52998224725');
      expect(result.type).toBe(DocumentType.CPF);
      expect(result.last4).toBe('4725');
    });

    it('validates and classifies a valid CNPJ with formatting', () => {
      const result = validateAndClassifyDocument('11.222.333/0001-81');
      expect(result.normalized).toBe('11222333000181');
      expect(result.type).toBe(DocumentType.CNPJ);
      expect(result.last4).toBe('0181');
    });

    it('rejects CPF with invalid check digits', () => {
      expect(() => validateAndClassifyDocument('529.982.247-99')).toThrow(DocumentValidationError);
    });

    it('rejects repeated digits', () => {
      expect(() => validateAndClassifyDocument('111.111.111-11')).toThrow(DocumentValidationError);
      expect(() => validateAndClassifyDocument('00.000.000/0000-00')).toThrow(DocumentValidationError);
    });

    it('rejects invalid length', () => {
      expect(() => validateAndClassifyDocument('123456')).toThrow(DocumentValidationError);
    });
  });

  describe('hashDocument', () => {
    it('generates deterministic HMAC-SHA256 hex string for uniqueness indexing', () => {
      const hash1 = hashDocument(validCpf);
      const hash2 = hashDocument(validCpf);
      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);

      const otherHash = hashDocument(validCnpj);
      expect(otherHash).not.toBe(hash1);
    });
  });

  describe('encryptDocument and decryptDocument', () => {
    it('encrypts with AES-256-GCM and decrypts back to original value', () => {
      const { encrypted, keyVersion } = encryptDocument(validCpf, 1);
      expect(keyVersion).toBe(1);
      expect(encrypted).toContain(':');

      const decrypted = decryptDocument(encrypted, keyVersion);
      expect(decrypted).toBe(validCpf);
    });

    it('fails to decrypt if payload has been tampered with', () => {
      const { encrypted, keyVersion } = encryptDocument(validCpf, 1);
      const parts = encrypted.split(':');
      // Tamper with ciphertext
      parts[1] = '00' + parts[1].slice(2);
      const tampered = parts.join(':');

      expect(() => decryptDocument(tampered, keyVersion)).toThrow();
    });
  });

  describe('rotateDocument (key versioning)', () => {
    it('rotates document encryption from version 1 to version 2 seamlessly', () => {
      const v1 = encryptDocument(validCpf, 1);
      expect(v1.keyVersion).toBe(1);

      const v2 = rotateDocument(v1.encrypted, 1, 2);
      expect(v2.keyVersion).toBe(2);

      // Successfully decrypts with version 2
      const decryptedV2 = decryptDocument(v2.encrypted, 2);
      expect(decryptedV2).toBe(validCpf);
    });
  });

  describe('maskDocument & maskFromLast4', () => {
    it('masks CPF showing partial digits', () => {
      const masked = maskDocument(validCpf, DocumentType.CPF);
      expect(masked).toBe('***.***.247-25');
    });

    it('masks CNPJ showing partial digits', () => {
      const masked = maskDocument(validCnpj, DocumentType.CNPJ);
      expect(masked).toBe('**.***.***/0001-81');
    });

    it('masks from last4 string', () => {
      expect(maskFromLast4('4725', DocumentType.CPF)).toBe('***.***.47-25');
      expect(maskFromLast4('0181', DocumentType.CNPJ)).toBe('**.***.***/01-81');
    });
  });
});
`;

const phoneSpec = `import { normalizePhone, isValidPhone, formatPhone } from './phone-normalizer';

describe('PhoneNormalizer', () => {
  it('normalizes 11-digit mobile phone', () => {
    expect(normalizePhone('(11) 98765-4321')).toBe('11987654321');
  });

  it('normalizes 10-digit landline phone', () => {
    expect(normalizePhone('11 3456-7890')).toBe('1134567890');
  });

  it('returns null for invalid lengths or empty inputs', () => {
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
    expect(normalizePhone('1234567890123')).toBeNull();
  });

  it('validates phone', () => {
    expect(isValidPhone('(11) 99999-0000')).toBe(true);
    expect(isValidPhone('invalid')).toBe(false);
  });

  it('formats digits back into human-readable phone', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
  });
});
`;

fs.writeFileSync('d:/Trabalho/Projetos/barbaraBackend/src/identity/document-crypto.spec.ts', cryptoSpec, 'utf8');
console.log('Created document-crypto.spec.ts');

fs.writeFileSync('d:/Trabalho/Projetos/barbaraBackend/src/identity/phone-normalizer.spec.ts', phoneSpec, 'utf8');
console.log('Created phone-normalizer.spec.ts');
