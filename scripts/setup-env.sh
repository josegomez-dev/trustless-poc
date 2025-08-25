#!/bin/bash

# Trustless Work POC Environment Setup Script
# This script helps you set up your environment variables

echo "🚀 Trustless Work POC Environment Setup"
echo "======================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env.local file is preserved."
        exit 0
    fi
fi

# Copy env.example to .env.local
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example not found! Please make sure you're in the project root directory."
    exit 1
fi

echo ""
echo "🔧 Environment Configuration"
echo "=========================="
echo ""

# Prompt for network selection
echo "Select your Stellar network:"
echo "1) TESTNET (recommended for development)"
echo "2) PUBLIC (mainnet - use with caution)"
read -p "Enter your choice (1 or 2): " network_choice

case $network_choice in
    1)
        sed -i '' 's/NEXT_PUBLIC_STELLAR_NETWORK=.*/NEXT_PUBLIC_STELLAR_NETWORK=TESTNET/' .env.local
        echo "✅ Set network to TESTNET"
        ;;
    2)
        sed -i '' 's/NEXT_PUBLIC_STELLAR_NETWORK=.*/NEXT_PUBLIC_STELLAR_NETWORK=PUBLIC/' .env.local
        echo "✅ Set network to PUBLIC"
        ;;
    *)
        echo "⚠️  Invalid choice, defaulting to TESTNET"
        sed -i '' 's/NEXT_PUBLIC_STELLAR_NETWORK=.*/NEXT_PUBLIC_STELLAR_NETWORK=TESTNET/' .env.local
        ;;
esac

# Prompt for platform fee
echo ""
read -p "Enter platform fee percentage (default: 4): " platform_fee
if [ -n "$platform_fee" ]; then
    sed -i '' "s/NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=.*/NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=$platform_fee/" .env.local
    echo "✅ Set platform fee to $platform_fee%"
else
    echo "✅ Using default platform fee: 4%"
fi

# Prompt for escrow deadline
echo ""
read -p "Enter default escrow deadline in days (default: 7): " escrow_deadline
if [ -n "$escrow_deadline" ]; then
    sed -i '' "s/NEXT_PUBLIC_DEFAULT_ESCROW_DEADLINE_DAYS=.*/NEXT_PUBLIC_DEFAULT_ESCROW_DEADLINE_DAYS=$escrow_deadline/" .env.local
    echo "✅ Set escrow deadline to $escrow_deadline days"
else
    echo "✅ Using default escrow deadline: 7 days"
fi

# Prompt for debug mode
echo ""
read -p "Enable debug mode? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i '' 's/NEXT_PUBLIC_DEBUG_MODE=.*/NEXT_PUBLIC_DEBUG_MODE=true/' .env.local
    echo "✅ Debug mode enabled"
else
    sed -i '' 's/NEXT_PUBLIC_DEBUG_MODE=.*/NEXT_PUBLIC_DEBUG_MODE=false/' .env.local
    echo "✅ Debug mode disabled"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review your .env.local file"
echo "2. Install dependencies: npm install"
echo "3. Start development server: npm run dev"
echo ""
echo "📁 Your .env.local file contains:"
echo "=================================="
cat .env.local
echo ""
echo "🔒 Remember: .env.local is already in .gitignore and won't be committed"
echo ""
echo "Happy coding! 🚀⭐"
