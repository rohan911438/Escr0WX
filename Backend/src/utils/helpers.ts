import crypto from 'crypto';

/**
 * Generate a unique ID for listings and other entities
 */
export const generateId = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random challenge for authentication
 */
export const generateChallenge = (): string => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `EscrowX authentication challenge: ${timestamp}:${randomBytes}`;
};

/**
 * Generate a secure hash of data
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Validate Ethereum address format
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate transaction hash format
 */
export const isValidTxHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Convert Wei to Ether string
 */
export const weiToEther = (wei: string): string => {
  const weiNum = BigInt(wei);
  const etherNum = weiNum / BigInt(10 ** 18);
  const remainder = weiNum % BigInt(10 ** 18);
  
  if (remainder === BigInt(0)) {
    return etherNum.toString();
  }
  
  const decimalPart = remainder.toString().padStart(18, '0').replace(/0+$/, '');
  return `${etherNum}.${decimalPart}`;
};

/**
 * Convert Ether to Wei string
 */
export const etherToWei = (ether: string): string => {
  const [whole, decimal = ''] = ether.split('.');
  const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
  const wei = BigInt(whole) * BigInt(10 ** 18) + BigInt(paddedDecimal);
  return wei.toString();
};

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"']/g, '')
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse and validate JSON safely
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};