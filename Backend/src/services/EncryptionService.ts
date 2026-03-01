import crypto from 'crypto';
import { logger } from '@/utils/logger';
import { DeliveryCredentials } from '@/types/listing';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  
  constructor() {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }
    
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    if (key.length !== this.keyLength) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
    }
  }

  /**
   * Encrypt delivery credentials
   */
  async encryptCredentials(credentials: DeliveryCredentials): Promise<string> {
    try {
      const plaintext = JSON.stringify(credentials);
      const encrypted = this.encrypt(plaintext);
      
      logger.info('Delivery credentials encrypted successfully');
      return encrypted;
    } catch (error) {
      logger.error('Error encrypting credentials:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt delivery credentials
   */
  async decryptCredentials(encryptedData: string): Promise<DeliveryCredentials> {
    try {
      const plaintext = this.decrypt(encryptedData);
      const credentials = JSON.parse(plaintext) as DeliveryCredentials;
      
      logger.info('Delivery credentials decrypted successfully');
      return credentials;
    } catch (error) {
      logger.error('Error decrypting credentials:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Encrypt any string data
   */
  encrypt(plaintext: string): string {
    try {
      const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'utf8');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return combined.toString('base64');
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt string data
   */
  decrypt(encryptedData: string): string {
    try {
      const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'utf8');
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extract IV, auth tag, and encrypted data
      const iv = combined.slice(0, this.ivLength);
      const authTag = combined.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = combined.slice(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate a hash of sensitive data for verification
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify if plaintext matches the hash
   */
  verifyHash(plaintext: string, hash: string): boolean {
    const computedHash = this.hashData(plaintext);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }
}