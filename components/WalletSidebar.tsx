'use client'

import { useState, useEffect } from 'react'
import { useGlobalWallet } from '@/contexts/WalletContext'
import { stellarConfig } from '@/lib/wallet-config'

interface WalletSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const WalletSidebar = ({ isOpen, onToggle }: WalletSidebarProps) => {
  const { walletData, isConnected, connect, disconnect, isFreighterAvailable } = useGlobalWallet()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isNewWindow, setIsNewWindow] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  // Dispatch custom event to move main content
  useEffect(() => {
    const event = new CustomEvent('walletSidebarToggle', {
      detail: { isOpen, isExpanded }
    })
    window.dispatchEvent(event)
  }, [isOpen, isExpanded])

  // Dispatch wallet state change events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('walletStateChanged', {
        detail: { 
          isConnected,
          walletData,
          isFreighterAvailable
        }
      }))
    }
  }, [isConnected, walletData, isFreighterAvailable])

  // Handle escape key to close sidebar and custom event to open
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle()
      }
    }
    
    const handleToggleWallet = () => {
      onToggle()
    }
    
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('toggleWalletSidebar', handleToggleWallet)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('toggleWalletSidebar', handleToggleWallet)
    }
  }, [isOpen, onToggle])

  // Open wallet in new window
  const openInNewWindow = () => {
    const width = 400
    const height = 600
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const newWindow = window.open(
      '/wallet',
      'StellarWallet',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )
    
    if (newWindow) {
      setIsNewWindow(true)
      newWindow.onbeforeunload = () => setIsNewWindow(false)
    }
  }

  const copyAddress = () => {
    if (walletData?.publicKey) {
      navigator.clipboard.writeText(walletData.publicKey)
      // Show temporary success message
      const button = document.getElementById('copy-address-btn')
      if (button) {
        const originalText = button.textContent
        button.textContent = '✅ Copied!'
        button.classList.add('bg-green-500/20', 'text-green-300')
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove('bg-green-500/20', 'text-green-300')
        }, 2000)
      }
    }
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) / 1000000 // Convert from Stellar units
    return num.toFixed(2)
  }

  const getNetworkColor = () => {
    return stellarConfig.network === 'TESTNET' 
      ? 'from-yellow-500 to-amber-500' 
      : 'from-green-500 to-emerald-500'
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full z-50 transform transition-all duration-500 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${isExpanded ? 'w-96' : 'w-20'}
        bg-gradient-to-b from-slate-900/98 to-slate-800/98 backdrop-blur-2xl
        border-l border-white/30 shadow-2xl
        ${isExpanded ? 'shadow-[-20px_0_60px_rgba(0,0,0,0.8)]' : 'shadow-[-10px_0_30px_rgba(0,0,0,0.6)]'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">SW</span>
            </div>
            {isExpanded && (
              <div className="animate-fadeIn">
                <h3 className="text-white font-semibold">Stellar Wallet</h3>
                <p className="text-xs text-white/60">Trustless Work POC</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <div className={`transform transition-transform duration-300 ${!isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                ▶
              </div>
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 lg:hidden"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isConnected ? (
            // Not Connected State
            <div className={isExpanded ? "text-center py-8" : "text-center py-4"}>
              <div className={`${isExpanded ? "w-16 h-16" : "w-12 h-12"} bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500`}>
                <span className={isExpanded ? "text-2xl" : "text-xl"}>🔐</span>
              </div>
              
              {isExpanded && (
                <div className="animate-fadeIn">
                  <h3 className="font-semibold text-white mb-2">Connect Wallet</h3>
                  <p className="text-white/70 text-sm mb-6">
                    Connect your Stellar wallet to start using the demos
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {/* Freighter Connect Button */}
                {isFreighterAvailable ? (
                  <button
                    onClick={async () => {
                      setIsConnecting(true)
                      try {
                        await connect() // Connect to Freighter
                        if (!isExpanded) {
                          setIsExpanded(true) // Auto-expand if collapsed
                        }
                      } finally {
                        setIsConnecting(false)
                      }
                    }}
                    disabled={isConnecting}
                    className={`w-full ${isExpanded ? "px-4 py-3" : "px-3 py-2"} bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    title={!isExpanded ? "Connect Freighter" : undefined}
                  >
                    {isConnecting ? '🔄' : '🔗'} {isExpanded && (isConnecting ? 'Connecting...' : '🔗 Connect Freighter')}
                  </button>
                ) : (
                  <div className={`text-center ${isExpanded ? "py-2" : "py-1"}`}>
                    <p className="text-xs text-white/60">
                      {isExpanded ? "Freighter not detected. Install the extension or use manual input below." : "⚠️"}
                    </p>
                  </div>
                )}
                
                {/* Manual Address Input */}
                {isExpanded && (
                  <div className="space-y-2">
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2">Or enter wallet address manually:</p>
                    </div>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="G... (Stellar address)"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      onClick={async () => {
                        if (!manualAddress.trim()) return
                        setIsConnecting(true)
                        try {
                          await connect(manualAddress.trim())
                          setManualAddress('')
                        } finally {
                          setIsConnecting(false)
                        }
                      }}
                      disabled={isConnecting || !manualAddress.trim()}
                      className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? '🔄 Connecting...' : '🔗 Connect Manual Address'}
                    </button>
                  </div>
                )}
                
                <button
                  onClick={openInNewWindow}
                  className={`w-full ${isExpanded ? "px-4 py-3" : "px-3 py-2"} bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-300 hover:border-white/40`}
                  title={!isExpanded ? "Open in New Window" : undefined}
                >
                  🪟 {isExpanded && "Open in New Window"}
                </button>
              </div>

              {/* Network Info - Only show when expanded */}
              {isExpanded && (
                <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 animate-fadeIn">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className={`w-2 h-2 bg-gradient-to-r ${getNetworkColor()} rounded-full animate-pulse`}></div>
                    <span className="text-xs text-white/60">Network</span>
                  </div>
                  <span className={`text-sm font-medium bg-gradient-to-r ${getNetworkColor()} bg-clip-text text-transparent`}>
                    {stellarConfig.network}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // Connected State
            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  {isExpanded && <span className="text-green-300 text-sm font-medium animate-fadeIn">Connected</span>}
                </div>
                
                <div className="space-y-3">
                  <div>
                    {isExpanded && <p className="text-xs text-white/60 mb-1 animate-fadeIn">Wallet Address</p>}
                    <div className="flex items-center space-x-2">
                      <code className={`text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded flex-1 font-mono ${!isExpanded ? "text-center" : ""} transition-all duration-300`}>
                        {isExpanded 
                          ? walletData?.publicKey 
                          : `${walletData?.publicKey?.slice(0, 6)}...${walletData?.publicKey?.slice(-4)}`
                        }
                      </code>
                      <button
                        id="copy-address-btn"
                        onClick={copyAddress}
                        className="p-1 text-green-300 hover:text-green-200 hover:bg-green-500/20 rounded transition-all duration-300 hover:scale-110"
                        title="Copy address"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  {/* Network Info - Only show when expanded */}
                  {isExpanded && (
                    <div className="animate-fadeIn">
                      <p className="text-xs text-white/60 mb-1">Network</p>
                      <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getNetworkColor()} bg-clip-text text-transparent font-medium`}>
                        {walletData?.network}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={openInNewWindow}
                  className={`w-full ${isExpanded ? "px-3 py-2" : "px-2 py-2"} bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded-lg transition-all duration-300 hover:border-white/40 flex items-center justify-center space-x-2`}
                  title={!isExpanded ? "Open in New Window" : undefined}
                >
                  <span>🪟</span>
                  {isExpanded && <span className="animate-fadeIn">Open in New Window</span>}
                </button>
                
                <button
                  onClick={disconnect}
                  className={`w-full ${isExpanded ? "px-3 py-2" : "px-2 py-2"} bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 text-sm rounded-lg transition-all duration-300 hover:border-red-400/50 flex items-center justify-center space-x-2`}
                  title={!isExpanded ? "Disconnect" : undefined}
                >
                  <span>🔌</span>
                  {isExpanded && <span className="animate-fadeIn">Disconnect</span>}
                </button>
              </div>

              {/* Demo Status - Only show when expanded */}
              {isExpanded && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 animate-fadeIn">
                  <h4 className="text-white font-medium text-sm mb-2">Demo Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Ready to test</span>
                      <span className="text-green-400">✅</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Wallet connected</span>
                      <span className="text-green-400">✅</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Network active</span>
                      <span className="text-green-400">✅</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>v1.0.0</span>
            {isExpanded && (
              <span className="text-cyan-400">Stellar POC</span>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <>
          {/* Mobile toggle button */}
          <button
            onClick={onToggle}
            className="fixed top-20 right-4 z-30 p-3 bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 lg:hidden relative"
            title="Open Wallet"
          >
            🔐
            {!isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
            )}
          </button>
          
          {/* Desktop toggle button */}
          <button
            onClick={onToggle}
            className="fixed top-20 right-4 z-30 p-3 bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hidden lg:block relative"
            title="Open Wallet"
          >
            <div className="flex items-center space-x-2">
              <span>🔐</span>
              <span className="text-sm font-medium">Wallet</span>
            </div>
            {!isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
            )}
          </button>
        </>
      )}

      {/* Wallet Connection Banner */}
      {!isConnected && !isConnecting && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideInUp">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-2xl border-t-4 border-amber-400 relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
            <div className="absolute inset-0 animate-shimmer"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="container mx-auto px-4 py-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse shadow-lg animate-float">
                      <span className="text-2xl">🔐</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white drop-shadow-sm">Wallet Not Connected</h3>
                    <p className="text-base text-white/95 leading-relaxed">
                      Connect your Stellar wallet to start testing the Trustless Work demos and unlock all features
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={async () => {
                      setIsConnecting(true)
                      onToggle() // Open the sidebar
                      // Small delay to ensure sidebar opens smoothly before expanding
                      setTimeout(() => {
                        setIsExpanded(true) // Expand it
                      }, 100)
                      try {
                        if (isFreighterAvailable) {
                          await connect() // Connect to Freighter
                        } else {
                          // Just open sidebar for manual input
                          console.log('Freighter not available, opening sidebar for manual input')
                        }
                      } finally {
                        setIsConnecting(false)
                      }
                    }}
                    disabled={isConnecting}
                    className="px-8 py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
                  </button>
                  <button
                    onClick={onToggle}
                    className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 border-2 border-white/30 hover:border-white/50"
                  >
                    🪟 Open Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
