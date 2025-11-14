const crypto = require('crypto');

// Encryption utility for sensitive data fields
// Uses AES-256-GCM for authenticated encryption

const ALGORITHM = 'aes-256-gcm';
const ENCODING = 'hex';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key!!';

class EncryptionService {
  constructor(secretKey = ENCRYPTION_KEY) {
    // Secret key should be 32 bytes for AES-256
    if (!secretKey) {
      throw new Error('Encryption secret key is required');
    }
    // Ensure key is 32 bytes (256 bits)
    this.secretKey = secretKey.length >= 32 
      ? secretKey.substring(0, 32)
      : crypto.createHash('sha256').update(secretKey).digest('hex').substring(0, 32);
  }

  /**
   * Encrypt sensitive data
   * @param {string} plaintext - Data to encrypt
   * @returns {string} - IV:encryptedData:authTag (all hex encoded)
   */
  encrypt(plaintext) {
    if (!plaintext) return null;

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(this.secretKey, ENCODING),
        iv
      );

      let encrypted = cipher.update(String(plaintext), 'utf8', ENCODING);
      encrypted += cipher.final(ENCODING);

      const authTag = cipher.getAuthTag();

      // Return IV:encrypted:authTag format
      return `${iv.toString(ENCODING)}:${encrypted}:${authTag.toString(ENCODING)}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - IV:encryptedData:authTag format
   * @returns {string} - Decrypted plaintext
   */
  decrypt(encryptedData) {
    if (!encryptedData) return null;

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], ENCODING);
      const encrypted = parts[1];
      const authTag = Buffer.from(parts[2], ENCODING);

      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(this.secretKey, ENCODING),
        iv
      );

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt object properties
   * @param {object} obj - Object containing sensitive fields
   * @param {array} fieldsToEncrypt - Field names to encrypt
   * @returns {object} - Object with encrypted fields
   */
  encryptFields(obj, fieldsToEncrypt) {
    const encrypted = { ...obj };

    fieldsToEncrypt.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });

    return encrypted;
  }

  /**
   * Decrypt object properties
   * @param {object} obj - Object with encrypted fields
   * @param {array} fieldsToDecrypt - Field names to decrypt
   * @returns {object} - Object with decrypted fields
   */
  decryptFields(obj, fieldsToDecrypt) {
    const decrypted = { ...obj };

    fieldsToDecrypt.forEach(field => {
      if (decrypted[field]) {
        decrypted[field] = this.decrypt(decrypted[field]);
      }
    });

    return decrypted;
  }

  /**
   * Generate a secure random key for encryption
   * @returns {string} - 64 character hex string (32 bytes)
   */
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Legacy function-based exports for backward compatibility
function encrypt(text) {
  if (!text) return null;
  try {
    const service = new EncryptionService();
    return service.encrypt(text);
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  try {
    const service = new EncryptionService();
    return service.decrypt(encryptedText);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
}

module.exports = {
  EncryptionService,
  encrypt,
  decrypt
};