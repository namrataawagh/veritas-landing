import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Courier_Prime } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const _ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });

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
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
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
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
