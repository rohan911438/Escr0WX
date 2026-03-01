import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import { promisify } from 'util';
import { logger } from '@/utils/logger';

let db: Database;

// Promisified database methods for async/await support
export interface PromiseDatabase {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  exec: (sql: string) => Promise<void>;
  close: () => Promise<void>;
}

let promiseDb: PromiseDatabase;

export const initializeDatabase = (dbPath?: string): PromiseDatabase => {
  const databasePath = dbPath || process.env.DATABASE_PATH || './data/escrowx.db';
  const resolvedPath = path.resolve(databasePath);
  
  try {
    // Create directory if it doesn't exist
    const dbDir = path.dirname(resolvedPath);
    require('fs').mkdirSync(dbDir, { recursive: true });
    
    db = new sqlite3.Database(resolvedPath, (err) => {
      if (err) {
        logger.error('Failed to initialize database:', err);
        throw err;
      }
      logger.info(`Database initialized at: ${resolvedPath}`);
    });
    
    // Enable WAL mode and foreign keys
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    
    // Create promisified interface
    promiseDb = {
      get: promisify(db.get.bind(db)),
      all: promisify(db.all.bind(db)),
      run: function(sql: string, params?: any[]) {
        return new Promise((resolve, reject) => {
          db.run(sql, params || [], function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });
      },
      exec: promisify(db.exec.bind(db)),
      close: promisify(db.close.bind(db))
    };
    
    // Create tables
    createTables();
    
    return promiseDb;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = (): PromiseDatabase => {
  if (!promiseDb) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return promiseDb;
};

export const closeDatabase = (): void => {
  if (db) {
    db.close((err) => {
      if (err) {
        logger.error('Error closing database:', err);
      } else {
        logger.info('Database connection closed');
      }
    });
  }
};

const createTables = async (): Promise<void> => {
  try {
    // Users table for tracking wallet addresses and stats
    await promiseDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT UNIQUE NOT NULL,
        nonce INTEGER DEFAULT 0,
        total_listings INTEGER DEFAULT 0,
        total_purchases INTEGER DEFAULT 0,
        reputation_score REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Listings table for escrow listing metadata
    await promiseDb.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id TEXT UNIQUE NOT NULL,
        creator_address TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price TEXT NOT NULL,
        currency TEXT DEFAULT 'ETH',
        delivery_time INTEGER NOT NULL,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'OPEN',
        fulfiller_address TEXT,
        encrypted_credentials TEXT,
        proof_hash TEXT,
        contract_tx_hash TEXT,
        blockchain_listing_id BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_address) REFERENCES users(wallet_address),
        FOREIGN KEY (fulfiller_address) REFERENCES users(wallet_address)
      )
    `);

    // Proofs table for delivery proof submissions
    await promiseDb.exec(`
      CREATE TABLE IF NOT EXISTS proofs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id TEXT NOT NULL,
        submitter_address TEXT NOT NULL,
        proof_hash TEXT NOT NULL,
        proof_data TEXT NOT NULL,
        delivery_notes TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        verification_tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME,
        FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
        FOREIGN KEY (submitter_address) REFERENCES users(wallet_address)
      )
    `);

    // Events table for blockchain event history
    await promiseDb.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        contract_address TEXT NOT NULL,
        transaction_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        block_hash TEXT NOT NULL,
        listing_id TEXT,
        user_address TEXT,
        event_data TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        solana_tx_signature TEXT,
        solana_account_pubkey TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(transaction_hash, event_name)
      )
    `);

    // Migrate existing events table to add Solana columns if they don't exist
    await promiseDb.exec(`
      ALTER TABLE events ADD COLUMN solana_tx_signature TEXT DEFAULT NULL
    `).catch(() => {
      // Column already exists, ignore error
    });
    
    await promiseDb.exec(`
      ALTER TABLE events ADD COLUMN solana_account_pubkey TEXT DEFAULT NULL
    `).catch(() => {
      // Column already exists, ignore error
    });

    // Auth challenges table for signature verification
    await promiseDb.exec(`
      CREATE TABLE IF NOT EXISTS auth_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL,
        challenge TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await promiseDb.exec(`
      CREATE INDEX IF NOT EXISTS idx_listings_creator ON listings(creator_address);
      CREATE INDEX IF NOT EXISTS idx_listings_fulfiller ON listings(fulfiller_address);
      CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
      CREATE INDEX IF NOT EXISTS idx_events_block ON events(block_number);
      CREATE INDEX IF NOT EXISTS idx_events_listing ON events(listing_id);
      CREATE INDEX IF NOT EXISTS idx_proofs_listing ON proofs(listing_id);
      CREATE INDEX IF NOT EXISTS idx_auth_wallet ON auth_challenges(wallet_address);
    `);

    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Failed to create database tables:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});