# EscrowX Backend

A production-ready Node.js + TypeScript backend service for the EscrowX Ethereum-native escrow protocol.

## Features

- 🔐 **Secure Escrow Management**: Handle escrow listings with encrypted delivery credentials
- 🔗 **Blockchain Integration**: Real-time event listening and state synchronization with Sepolia
- 📊 **Local Database**: SQLite-based storage with no external dependencies
- 🛡️ **Authentication**: Wallet signature verification with EIP-712 support
- 🎯 **Clean Architecture**: Layered design with clear separation of concerns
- 🔄 **Background Jobs**: Automatic blockchain state reconciliation
- 📝 **Type Safety**: Full TypeScript coverage with Zod validation
- 🚀 **Production Ready**: Structured logging, error handling, and security headers

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - Add your Infura/Alchemy WebSocket URL
# - Set your contract address
# - Configure other settings as needed

# Start development server
npm run dev
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

- `ETH_RPC_URL`: WebSocket RPC URL for Sepolia
- `CONTRACT_ADDRESS`: Your deployed escrow contract address
- `PRIVATE_KEY`: Private key for relayer actions (optional)
- `ENCRYPTION_KEY`: 32-character key for credential encryption

## Architecture

```
src/
├── routes/          # Express route definitions
├── controllers/     # Request handlers and validation
├── services/        # Business logic layer
├── blockchain/      # Smart contract integration
├── storage/         # Database repository layer
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── types/           # TypeScript type definitions
```

## API Endpoints

### Listings
- `GET /api/listings` - Get all listings with filters
- `POST /api/listings` - Create new listing metadata
- `GET /api/listings/:id` - Get specific listing details
- `POST /api/listings/:id/proof` - Submit proof of delivery

### Dashboard
- `GET /api/dashboard/stats` - Get user dashboard statistics
- `GET /api/dashboard/listings` - Get user's listings
- `GET /api/dashboard/purchases` - Get user's purchases

### Authentication
- `POST /api/auth/challenge` - Get signing challenge
- `POST /api/auth/verify` - Verify wallet signature

## Development

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format
```

## Database Schema

The SQLite database includes tables for:
- `listings` - Escrow listing metadata
- `proofs` - Delivery proof submissions
- `events` - Blockchain event history
- `users` - User activity and statistics

## Security Features

- ✅ Input validation with Zod schemas
- ✅ Rate limiting on all endpoints
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Encrypted credential storage
- ✅ Wallet signature authentication
- ✅ Replay attack protection

## Built With

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: ethers.js
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest