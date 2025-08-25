import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { config, validateConfig } from '@/lib/config'
// WalletProvider will be added when using the actual Stellar Wallets Kit
// TrustlessWorkProvider will be added when the actual package is available

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: config.app.name,
  description: `Next.js app with Trustless Work React library integration - ${config.app.version}`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Validate configuration on the client side
  if (typeof window !== 'undefined') {
    validateConfig()
  }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
