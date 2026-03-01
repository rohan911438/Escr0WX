#!/bin/bash

# EscrowX Solana Audit Ledger Deployment Script
# This script deploys the program to Solana Devnet

set -e

echo "🚀 EscrowX Solana Audit Ledger Deployment"
echo "========================================="

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install: npm install -g @coral-xyz/anchor-cli"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Configure Solana for Devnet
echo "🔧 Configuring Solana CLI for Devnet..."
solana config set --url devnet

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance --lamports)
MIN_BALANCE=2000000000  # 2 SOL in lamports

if [ "$BALANCE" -lt "$MIN_BALANCE" ]; then
    echo "⚠️  Low balance detected. Current: $BALANCE lamports"
    echo "🎁 Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

echo "✅ Sufficient balance confirmed"

# Build the program
echo "🔨 Building the program..."
anchor build

# Get the program ID
PROGRAM_ID=$(anchor keys list | grep escrowx_audit | awk '{print $2}')
echo "📋 Program ID: $PROGRAM_ID"

# Deploy the program
echo "🚀 Deploying to Devnet..."
anchor deploy

echo ""
echo "🎉 Deployment completed successfully!"
echo "=================================="
echo "📋 Program ID: $PROGRAM_ID"
echo "🌐 Network: Devnet"
echo "💰 Deployment cost: ~0.5 SOL"
echo ""
echo "📝 Next steps:"
echo "1. Update your frontend/backend with the Program ID"
echo "2. Run tests: anchor test"
echo "3. Test manually in Solana Playground"
echo ""
echo "🔗 Solana Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"