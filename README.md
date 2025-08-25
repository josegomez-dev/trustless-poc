# 🚀 Trustless Work POC

A **proof-of-concept** application demonstrating Trustless Work escrow management on the Stellar blockchain. This POC allows users to connect any Stellar wallet by entering their wallet address and test basic blockchain functionality.

## 🌟 What This POC Demonstrates

- **🔐 Wallet Connection**: Connect any Stellar wallet by entering your wallet address
- **⭐ Stellar Integration**: Built on the Stellar blockchain for fast, low-cost transactions
- **🧪 Testing Framework**: Test wallet functionality and transaction signing
- **🎨 Modern UI**: Beautiful gradient design with glassmorphism effects
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🎯 Use Cases

- **Developers**: Test Stellar wallet integration and blockchain functionality
- **Users**: Experience Trustless Work escrow management concepts
- **Businesses**: Explore decentralized work and payment solutions
- **Educators**: Demonstrate blockchain technology in action

## 📋 Prerequisites

Before you begin, ensure you have the following:

### Required Software
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Stellar Wallet
- **Any Stellar wallet** with a public address (starts with "G")
- **Examples**: Freighter, Albedo, xBull, Rabet, or any other Stellar wallet
- **Network**: Testnet or Mainnet (POC works with both)

## 🔧 Environment Configuration

The application uses environment variables for configuration. You can set them up in two ways:

### Quick Setup (Recommended)
Use the interactive setup script:
```bash
./scripts/setup-env.sh
```

### Manual Setup
Copy `env.example` to `.env.local` and customize as needed:

### Required Environment Variables
- `NEXT_PUBLIC_STELLAR_NETWORK`: Set to `TESTNET` (development) or `PUBLIC` (mainnet)
- `NEXT_PUBLIC_DEFAULT_ASSET_CODE`: Default asset code (e.g., `USDC`)
- `NEXT_PUBLIC_DEFAULT_ASSET_ISSUER`: Asset issuer public key
- `NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE`: Platform fee percentage (0-100)

### Optional Environment Variables
- `NEXT_PUBLIC_APP_NAME`: Application name (defaults to "Trustless Work App")
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NEXT_PUBLIC_DEBUG_MODE`: Enable debug logging (`true`/`false`)
- `NEXT_PUBLIC_PLATFORM_PUBLIC_KEY`: Platform wallet for receiving fees
- `NEXT_PUBLIC_DEFAULT_ESCROW_DEADLINE_DAYS`: Default escrow deadline in days

### Example Configuration
```bash
# .env.local
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_DEFAULT_ASSET_CODE=USDC
NEXT_PUBLIC_DEFAULT_ASSET_ISSUER=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=4
NEXT_PUBLIC_DEBUG_MODE=true
```

## 🚀 Quick Start Guide

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd trustless-poc

# Install dependencies
npm install
```

### Step 2: Environment Configuration
```bash
# Option 1: Use the interactive setup script (recommended)
./scripts/setup-env.sh

# Option 2: Manual setup
cp env.example .env.local
# Edit .env.local with your configuration
# See the Environment Variables section below for details
```

### Step 3: Start Development Server
```bash
# Start the development server
npm run dev
```

### Step 4: Open Your Browser
- Navigate to `http://localhost:3000`
- You'll see the beautiful Trustless Work POC interface

### Step 5: Connect Your Wallet
1. **Enter your Stellar wallet address** in the input field
   - Must start with "G" (e.g., `GBOHCLQDTL7DEBBUYCC3Q6UVO26XV3JXHPJ7AREQBJ66E3V5R67TFZ4A`)
2. **Click "🚀 Connect Wallet"**
3. **View your connection status** in the header banner

### Step 6: Test Functionality
- **🧪 Test Wallet Functionality**: Test basic wallet operations
- **🚀 Test Transaction Sending**: Verify transaction capabilities
- **📋 Copy Address**: Copy your full wallet address

## 🎨 Features

### Visual Design
- **Epic Gradient Background**: Dark theme with animated gradients
- **Glassmorphism Effects**: Modern glass-like UI elements
- **Responsive Layout**: Optimized for all screen sizes
- **Smooth Animations**: Hover effects and transitions

### Wallet Management
- **User Input**: Enter any Stellar wallet address
- **Real-time Connection**: Instant wallet connection status
- **Address Display**: Prominent wallet address display
- **Network Information**: Shows connected network (TESTNET/MAINNET)

### Testing Capabilities
- **Functionality Testing**: Test basic wallet operations
- **Transaction Testing**: Verify transaction signing and sending
- **Error Handling**: Comprehensive error messages and logging
- **Debug Console**: Detailed logs for developers

## 🔧 Technical Architecture

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework

### Stellar Integration
- **Stellar Wallet Kit**: Official Stellar wallet integration library
- **Custom Hooks**: React hooks for wallet management
- **Fallback System**: Robust error handling and fallbacks

### State Management
- **React Context**: Global state for escrow data
- **Custom Hooks**: Reusable wallet functionality
- **Local State**: Component-level state management

## 📱 User Interface Guide

### Main Components

#### 1. Header Banner
- **Title**: "🚀 Trustless Work POC"
- **Wallet Status**: Shows connection status when connected
- **Network Info**: Displays current network

#### 2. Stellar Information Section
- **Decentralized Network**: Information about Stellar's architecture
- **Fast & Low-Cost**: Transaction speed and cost benefits
- **Secure & Reliable**: Security features and uptime

#### 3. Wallet Connection
- **Input Field**: Enter your Stellar wallet address
- **Connect Button**: Large, prominent connection button
- **Status Display**: Real-time connection feedback

#### 4. Connected State
- **Wallet Info**: Full wallet address and network
- **Copy Functionality**: Easy address copying
- **Test Buttons**: Test wallet functionality

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Wallet Connection Fails
**Problem**: Cannot connect to wallet
**Solutions**:
- Verify wallet address format (must start with "G")
- Check browser console for error messages
- Ensure wallet address is correct
- Try refreshing the page

#### 2. No Wallet Address Display
**Problem**: Wallet connected but address not showing
**Solutions**:
- Check browser console for errors
- Verify wallet data is properly set
- Try disconnecting and reconnecting

#### 3. Test Functions Fail
**Problem**: Test buttons return errors
**Solutions**:
- Check browser console for detailed error logs
- Verify wallet is properly connected
- Ensure network connectivity

#### 4. UI Not Loading
**Problem**: Page appears broken or unstyled
**Solutions**:
- Check if all dependencies are installed
- Verify Node.js version (16+)
- Clear browser cache and refresh

### Debug Information

The app provides comprehensive logging:
- **Connection Attempts**: All wallet connection tries
- **Error Details**: Specific error messages and stack traces
- **Fallback Attempts**: When primary methods fail
- **Status Updates**: Real-time connection state changes

#### How to Access Debug Info
1. **Open Browser Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console Tab**: View all log messages
3. **Look for Error Messages**: Red text indicates errors
4. **Check Network Tab**: Verify API calls and responses

## 🔮 Future Enhancements

### Planned Features
- **Real Escrow Management**: Actual escrow contract creation
- **Multi-Wallet Support**: Connect multiple wallets simultaneously
- **Transaction History**: View past transactions
- **Network Switching**: Toggle between Testnet and Mainnet
- **Advanced Testing**: More comprehensive wallet testing

### Integration Possibilities
- **Stellar Horizon API**: Real blockchain data
- **Smart Contract Integration**: Actual escrow contracts
- **Payment Processing**: Real payment flows
- **Multi-Currency Support**: Various Stellar assets

## 📚 Additional Resources

### Documentation
- **IMPLEMENTATION_GUIDE.md**: Detailed technical implementation
- **Stellar Documentation**: [developers.stellar.org](https://developers.stellar.org)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

### Community
- **Stellar Discord**: Join the Stellar developer community
- **GitHub Issues**: Report bugs or request features
- **Developer Forums**: Get help from the community

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Testing
- **Test on different browsers**
- **Verify mobile responsiveness**
- **Check wallet compatibility**
- **Validate error handling**

### Documentation
- **Update README sections**
- **Add code comments**
- **Create tutorials**
- **Improve user guides**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
1. **Check this README** for common solutions
2. **Review the console logs** for error details
3. **Search existing issues** for similar problems
4. **Create a new issue** with detailed information

### Issue Reporting
When reporting issues, please include:
- **Browser and version**
- **Operating system**
- **Wallet type and address**
- **Error messages from console**
- **Steps to reproduce**
- **Expected vs actual behavior**

---

## 🎉 Ready to Get Started?

1. **Install dependencies**: `npm install`
2. **Start the server**: `npm run dev`
3. **Open your browser**: Navigate to `http://localhost:3000`
4. **Enter your wallet address**: Any Stellar wallet address
5. **Connect and test**: Explore the Trustless Work POC!

**Happy coding! 🚀⭐**
