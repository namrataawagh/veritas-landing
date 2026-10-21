"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Menu, Server, X } from "lucide-react"
import { AuthControls, AuthProvider } from "@/components/auth"
import "@/app/home-theme.css"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--tg-inter" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--tg-mono" })

const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Docs", href: "/documentation" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/#download" },
  { label: "About", href: "/about" },
]

const FOOTER_COLS = [
  { heading: "Product", links: [{ label: "Overview", href: "/product" }, { label: "How It Works", href: "/how-it-works" }, { label: "Use Cases", href: "/use-cases" }, { label: "Pricing", href: "/pricing" }] },
  { heading: "Resources", links: [{ label: "Documentation", href: "/documentation" }, { label: "Quickstart", href: "/documentation/quickstart" }, { label: "GitHub", href: "https://github.com/shreyaaassss/Veritas", external: true }] },
  { heading: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Book a Demo", href: "/book-demo" }] },
  { heading: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "License", href: "/license" }, { label: "Security", href: "/security" }] },
]

const PLATFORMS = ["Linux", "macOS", "Windows", "Kubernetes"]

/** Fades children in once they scroll into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`tg-reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/** Homepage design system wrapper: fonts, sign-in state, header and footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false)

  return (
    <div className={`tg ${inter.variable} ${mono.variable}`}>
    <AuthProvider>

      {/* ── Header ── */}
      <header className="tg-header">
        <div className="tg-container">
          <nav className="tg-nav" aria-label="Main">
            <Link href="/" className="tg-logo" aria-label="Veritas home"><img src="/veritas-wordmark.png" alt="Veritas" width={1726} height={375} /></Link>
            <div className="tg-nav-links">
              {NAV_LINKS.map(l => <Link key={l.label} href={l.href}>{l.label}</Link>)}
            </div>
            <div className="tg-nav-actions">
              <AuthControls variant="header" />
              <Link href="/book-demo" className="tg-btn tg-btn-white">Book a Demo</Link>
              <button className="tg-burger" onClick={() => setMenu(v => !v)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}>
                {menu ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
          {menu && (
            <div className="tg-menu">
              {[...NAV_LINKS, { label: "Contact", href: "/contact" }, { label: "Book a Demo", href: "/book-demo" }].map(l => (
                <Link key={l.label} href={l.href} onClick={() => setMenu(false)}>{l.label}</Link>
              ))}
              <AuthControls variant="menu" onAction={() => setMenu(false)} />
            </div>
          )}
        </div>
      </header>

      {children}

      {/* ── Footer ── */}
      <footer className="tg-footer">
        <div className="tg-container">
          <div className="tg-footer-top">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <Link href="/" className="tg-logo" aria-label="Veritas home"><img src="/veritas-wordmark.png" alt="Veritas" width={1726} height={375} /></Link>
              <p className="tg-body-sm" style={{ maxWidth: 240 }}>The DPDPA evidence layer for engineering teams. Self-hosted on your own infrastructure.</p>
              <span className="tg-pill" style={{ justifySelf: "start" }}>PILOTS OPEN</span>
            </div>
            {FOOTER_COLS.map(col => (
              <div key={col.heading}>
                <h4>{col.heading}</h4>
                <ul>
                  {col.links.map(l => (
                    <li key={l.label}>
                      {"external" in l && l.external
                        ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                        : <Link href={l.href}>{l.label}</Link>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="tg-footer-plat">
            <span className="tg-caption" style={{ marginRight: 8 }}>Runs on</span>
            {PLATFORMS.map(os => <span key={os} className="tg-chip"><Server size={12} style={{ marginRight: 6 }} />{os}</span>)}
          </div>
          <div className="tg-footer-bottom">
            <span className="tg-caption">© 2026 Veritas. All rights reserved.</span>
            <span className="tg-caption tg-mono">agentveritas.in</span>
          </div>
        </div>
      </footer>
    </AuthProvider>
    </div>
  )
}
