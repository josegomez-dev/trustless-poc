'use client'

import { WalletManager } from '@/components/WalletManager'
import { EscrowProvider } from '@/contexts/EscrowContext'
import { useWallet } from '@/lib/stellar-wallet-hooks'

// Wallet Address Display Component
const WalletAddressDisplay = () => {
  const { walletData, isConnected } = useWallet()
  
  if (!isConnected || !walletData) {
    return null
  }
  
  return (
    <div className="max-w-4xl mx-auto mb-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-300">
              Wallet Connected
            </h3>
            <p className="text-sm text-green-200">
              Network: {walletData.network}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-200 mb-1">Your Address:</p>
          <div className="flex items-center space-x-2">
            <p className="font-mono text-sm text-green-300 bg-green-900/50 px-3 py-2 rounded-lg border border-green-400/30">
              {walletData.publicKey.slice(0, 8)}...{walletData.publicKey.slice(-8)}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(walletData.publicKey);
                alert('Full wallet address copied to clipboard!');
              }}
              className="text-green-300 hover:text-green-100 text-lg transition-colors"
              title="Copy full address"
            >
              📋
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <EscrowProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-8">
            🚀 Trustless Work POC
          </h1>
          
          {/* Wallet Address Display */}
          <WalletAddressDisplay />
          
                                          {/* Stellar Information */}
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
              ⭐ About Stellar Blockchain
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-white/90">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/20">
                <div className="text-3xl mb-2">🌐</div>
                <h4 className="font-semibold mb-2">Decentralized Network</h4>
                <p className="text-sm">Open-source, decentralized protocol for digital currency to fiat money transfers</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg border border-white/20">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2">Fast & Low-Cost</h4>
                <p className="text-sm">3-5 second settlement times with minimal transaction fees</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-white/20">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-semibold mb-2">Secure & Reliable</h4>
                <p className="text-sm">Built on proven cryptographic principles with 99.9% uptime</p>
              </div>
            </div>
          </div>

          {/* POC Info */}
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl">
            <h3 className="text-xl font-semibold text-center text-white mb-4">
              🚀 Trustless Work POC
            </h3>
            <p className="text-white/90 text-center mb-2">
              This is a proof-of-concept for Trustless Work escrow management on Stellar.
            </p>
            <p className="text-white/90 text-center text-sm">
              Connect any Stellar wallet to test basic functionality and explore the future of decentralized work.
            </p>
          </div>
          
                                <WalletManager />

                                {/* Wallet Status Display */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                📱 Wallet Status
              </h3>
              <div className="text-center text-white/90">
                <p className="mb-2">
                  Connect your wallet above to see your address and test functionality.
                </p>
                <p className="text-sm">
                  This POC demonstrates basic wallet connection and testing capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EscrowProvider>
  );
}
