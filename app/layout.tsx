import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Same typefaces as the homepage theme (Inter for text, JetBrains Mono for labels and code)
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: 'Veritas  -  Trustworthy AI Agent Orchestration',
  description: 'Veritas helps teams build, verify, and orchestrate AI agents with full transparency. Every agent decision is logged, traceable, and explainable.',
  keywords: ['AI agents', 'AI verification', 'agent orchestration', 'trustworthy AI', 'transparent AI', 'LLM orchestration', 'AI observability'],
  authors: [{ name: 'Veritas' }],
  openGraph: {
    title: 'Veritas  -  Trustworthy AI Agent Orchestration',
    description: 'Build AI agents you can actually trust. Veritas logs, verifies, and makes every AI decision explainable.',
    type: 'website',
    siteName: 'Veritas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veritas  -  Trustworthy AI Agent Orchestration',
    description: 'Build AI agents you can actually trust. Every decision logged and explainable.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
