"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Inter, Geist_Mono } from "next/font/google"
import {
  ArrowRight, Boxes, Clock3, CornerDownLeft, Eye, FileWarning, Fingerprint, LayoutDashboard,
  Link2, Lock, Menu, Search, ScanSearch, Server, ShieldCheck, Sparkles, Target, Terminal, Users, X,
} from "lucide-react"
import "./home-theme.css"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--rc-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--rc-mono" })

// ─── Content ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Docs", href: "/documentation" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

const VIOLATIONS = [
  { icon: FileWarning, title: "Aadhaar number in application logs", svc: "payments-api", rule: "Data Exposure", sev: "HIGH", time: "14:02", fields: "aadhaar, phone, name", hash: "9f2c41…e8a71e" },
  { icon: FileWarning, title: "PAN and bank account in debug output", svc: "loan-service", rule: "Data Exposure", sev: "HIGH", time: "13:57", fields: "pan, acct_no", hash: "4bca07…31c441" },
  { icon: Target, title: "KYC data read by marketing-sync", svc: "marketing-sync", rule: "Purpose Violation", sev: "HIGH", time: "13:31", fields: "aadhaar (declared: onboarding_kyc)", hash: "af3e92…0d2b3b" },
  { icon: Clock3, title: "Retention window exceeded", svc: "crm-sync", rule: "Retention Exceeded", sev: "MEDIUM", time: "11:20", fields: "phone (180-day policy)", hash: "6fc6d1…7713b4" },
  { icon: Fingerprint, title: "Name, PIN code and DOB logged together", svc: "analytics-etl", rule: "Re-identification Risk", sev: "MEDIUM", time: "10:05", fields: "name, pincode, dob", hash: "c19a5e…b2f0d8" },
]

const PROBLEMS = [
  { icon: FileWarning, title: "Personal data leaks into logs", desc: "A debug line dumps a customer record. Without automated scanning, you'll never know  -  until an auditor finds it." },
  { icon: Target, title: "Data used beyond declared purpose", desc: "An API call accesses fields your privacy policy doesn't permit for that service. Purpose limitation violated silently." },
  { icon: Clock3, title: "Retention windows exceeded", desc: "Data from 3 years ago sits in a system that's only allowed to keep it for 6 months. Every day is a fresh violation." },
]

const RULES = [
  { title: "Data Exposure", severity: "HIGH", label: "Personal data appears where it must never appear  -  logs, debug output, API responses" },
  { title: "Purpose Violation", severity: "HIGH", label: "Data used in a system whose declared consent scope doesn't permit it" },
  { title: "Retention Exceeded", severity: "MEDIUM", label: "Data held past the permitted retention window for that field" },
  { title: "Re-identification Risk", severity: "MEDIUM", label: "Individually harmless fields appearing together that could identify a person" },
]

const AUDIENCES = [
  { icon: LayoutDashboard, label: "COMPLIANCE OFFICER", title: "Live violation detection", desc: "Every DPDPA violation appears on your dashboard the moment it's detected — via WebSocket live feed. Open a case, investigate with AI-assisted explanations, annotate, and resolve. Full case lifecycle in one view.", badges: ["Live Stream", "Case lifecycle"] },
  { icon: Link2, label: "DPO / AUDITOR", title: "Tamper-evident evidence chain", desc: "Every verdict is linked by SHA-256 hash to the previous one. The chain can be verified at any time — proving no record was altered. Export a signed PDF audit report for regulators on demand.", badges: ["Hash chain", "PDF export"] },
  { icon: Boxes, label: "ENGINEERING TEAM", title: "Agent deployment and monitoring", desc: "Deploy the Veritas Agent as a Docker container, .deb package, or Kubernetes DaemonSet. Each agent appears with a heartbeat status. Revoke any agent instantly from the dashboard.", badges: ["Docker", "Kubernetes DaemonSet"] },
  { icon: Lock, label: "CTO / SECURITY", title: "Zero data leaves your network", desc: "Everything runs on your infrastructure — server, evidence store, dashboard. No data transmitted to us. RBAC with 4 server-enforced roles. TLS by default. Machine-bound RSA-PSS licensing.", badges: ["On-premise", "RBAC"] },
]

type CodeLine = { t: "c" | "cmd" | "out" | "ok" | "url" | "gap" | "plain"; s?: string } | { t: "prop"; k: string; v: string }
const INSTALL: { title: string; desc: string; file: string; code: CodeLine[] }[] = [
  {
    title: "Install Veritas Server", desc: "One command on Ubuntu 22.04+", file: "terminal",
    code: [
      { t: "c", s: "# Install the Veritas Server (.deb)" }, { t: "cmd", s: "sudo apt install ./veritas_1.0.16_amd64.deb" }, { t: "gap" },
      { t: "c", s: "# Get your machine fingerprint" }, { t: "cmd", s: "sudo veritas fingerprint" }, { t: "gap" },
      { t: "out", s: "v2:a3f8c2d1e9b47f6c..." }, { t: "c", s: "# Send this hash to your Veritas contact" },
    ],
  },
  {
    title: "Install License", desc: "Machine-bound RSA-PSS signed .vlic", file: "terminal",
    code: [
      { t: "c", s: "# Install your signed license file" }, { t: "cmd", s: "sudo veritas license ./veritas.vlic" }, { t: "gap" },
      { t: "ok", s: "✓ License valid" }, { t: "ok", s: "✓ Machine fingerprint matched" }, { t: "ok", s: "✓ Veritas service started" }, { t: "gap" },
      { t: "url", s: "  → Dashboard: http://localhost:8000" },
    ],
  },
  {
    title: "Deploy Agent", desc: "One agent per application server", file: "agent-config.yaml",
    code: [
      { t: "c", s: "# agent-config.yaml" }, { t: "prop", k: "veritas_address", v: "'https://veritas.your-company.internal'" },
      { t: "prop", k: "registration_key", v: "'KEY-FROM-DASHBOARD'" }, { t: "plain", s: "sources:" }, { t: "plain", s: "  - type: file" },
      { t: "prop", k: "    path", v: "'/var/log/your-app/*.log'" }, { t: "plain", s: "  - type: docker" }, { t: "prop", k: "    container", v: "'order-service'" },
    ],
  },
  {
    title: "Define Data Policy", desc: "Upload org config — no code change needed", file: "org-config.yaml",
    code: [
      { t: "prop", k: "org_id", v: "'acme_retail'" }, { t: "plain", s: "fields:" }, { t: "plain", s: "  - field_name: aadhaar" },
      { t: "prop", k: "    declared_purpose", v: "'onboarding_kyc'" }, { t: "prop", k: "    retention_days", v: "180" },
      { t: "prop", k: "    source_system", v: "'partner-service'" }, { t: "gap" }, { t: "ok", s: "✓ Policy active — violations now detected" },
    ],
  },
]

const PLATFORMS = [
  { icon: Terminal, os: "Linux", pkg: "Ubuntu 22.04+" },
  { icon: Server, os: "macOS", pkg: "macOS 12+ (Apple Silicon)" },
  { icon: LayoutDashboard, os: "Windows", pkg: "Windows 10/11, Server 2019+" },
]

const FOOTER_COLS = [
  { heading: "Product", links: [{ label: "Overview", href: "/product" }, { label: "How It Works", href: "/how-it-works" }, { label: "Use Cases", href: "/use-cases" }] },
  { heading: "Resources", links: [{ label: "Documentation", href: "/documentation" }, { label: "Quickstart", href: "/documentation/quickstart" }, { label: "GitHub ↗", href: "https://github.com/shreyaaassss/Veritas", external: true }] },
  { heading: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Book a Demo", href: "/book-demo" }] },
  { heading: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "License", href: "/license" }, { label: "Security", href: "/security" }] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
    <div ref={ref} className={`rc-reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function SectionHead({ eyebrow, title, lede, center }: { eyebrow: string; title: string; lede?: string; center?: boolean }) {
  return (
    <Reveal className={`rc-section-head ${center ? "center" : ""}`}>
      <span className="rc-eyebrow">{eyebrow}</span>
      <h2 className="rc-h2">{title}</h2>
      {lede && <p className="rc-body-lg">{lede}</p>}
    </Reveal>
  )
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <div className="rc-nav-wrap">
      <nav className="rc-nav" aria-label="Main">
        <Link href="/" className="rc-logo"><span className="rc-logo-mark" aria-hidden="true" />Veritas</Link>
        <div className="rc-nav-links">
          {NAV_LINKS.map(l => <Link key={l.label} href={l.href}>{l.label}</Link>)}
        </div>
        <Link href="/book-demo" className="rc-btn rc-btn-primary">Book a demo</Link>
        <button className="rc-burger" onClick={() => setOpen(v => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
      {open && (
        <div className="rc-menu">
          {NAV_LINKS.map(l => <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
          <Link href="/book-demo" onClick={() => setOpen(false)} className="rc-btn rc-btn-primary" style={{ justifyContent: "center", marginTop: 8 }}>Book a demo</Link>
        </div>
      )}
    </div>
  )
}

// ─── Product window (hero) ────────────────────────────────────────────────────
const QUERY = "status:open since:today"

function ProductWindow() {
  const [active, setActive] = useState(0)
  const [typed, setTyped] = useState(0)
  const [hover, setHover] = useState(false)

  // Type the search query once the window has landed
  useEffect(() => {
    if (typed >= QUERY.length) return
    const t = setTimeout(() => setTyped(n => n + 1), typed === 0 ? 1600 : 45)
    return () => clearTimeout(t)
  }, [typed])

  // Step through the results like someone pressing ↓
  useEffect(() => {
    if (hover) return
    const t = setInterval(() => setActive(i => (i + 1) % VIOLATIONS.length), 2400)
    return () => clearInterval(t)
  }, [hover])

  const v = VIOLATIONS[active]
  return (
    <div className="rc-window-stage">
      <div className="rc-window" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="rc-window-bar">
          <Search aria-hidden="true" />
          <div className="query">{QUERY.slice(0, typed)}<span className="caret" /></div>
          <span className="rc-badge ai"><Sparkles size={12} style={{ marginRight: 4 }} />AI</span>
        </div>
        <div className="rc-window-body">
          <div className="rc-list" role="listbox" aria-label="Live violations">
            <div className="rc-list-label">Live violations</div>
            {VIOLATIONS.map((row, i) => {
              const Icon = row.icon
              return (
                <button key={row.title} role="option" aria-selected={i === active} className={`rc-row ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>
                  <span className="rc-row-icon"><Icon /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="rc-row-title" style={{ display: "block" }}>{row.title}</span>
                    <span className="rc-row-sub" style={{ display: "block" }}>{row.svc} · {row.time}</span>
                  </span>
                  <span className={`rc-badge ${row.sev === "HIGH" ? "warm" : ""}`}>{row.sev}</span>
                </button>
              )
            })}
          </div>
          <div className="rc-detail">
            <div key={active} className="rc-detail-swap" style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`rc-badge ${v.sev === "HIGH" ? "warm" : ""}`}>{v.sev}</span>
                <span className="rc-badge">OPEN</span>
              </div>
              <div className="rc-h3" style={{ fontSize: 18 }}>{v.title}</div>
              <dl>
                <div><dt>Rule</dt><dd>{v.rule}</dd></div>
                <div><dt>Statute</dt><dd>DPDPA 2023 · reasonable security safeguards</dd></div>
                <div><dt>Fields</dt><dd className="mono">{v.fields}</dd></div>
                <div><dt>Evidence</dt><dd className="mono">sha256 {v.hash} <span style={{ color: "var(--color-success-green)" }}>· chain valid</span></dd></div>
              </dl>
            </div>
          </div>
        </div>
        <div className="rc-window-foot">
          <span className="left"><span className="rc-live" />Live · 4 agents connected</span>
          <span className="right">
            <span>Open case <span className="rc-kbd"><CornerDownLeft size={12} /></span></span>
            <span>Actions <span className="rc-kbd">⌘</span><span className="rc-kbd">K</span></span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Install terminal ─────────────────────────────────────────────────────────
function InstallTerminal() {
  const [step, setStep] = useState(0)
  const s = INSTALL[step]
  return (
    <div className="rc-term">
      <div className="rc-steps" role="tablist" aria-label="Installation steps">
        {INSTALL.map((it, i) => (
          <button key={it.title} role="tab" aria-selected={i === step} className={`rc-step ${i === step ? "active" : ""}`} onClick={() => setStep(i)}>
            <span className="n">0{i + 1}</span>
            <span><b>{it.title}</b><span>{it.desc}</span></span>
          </button>
        ))}
      </div>
      <div className="rc-code" role="tabpanel">
        <div className="rc-code-head"><i /><i /><i /><span className="file">{s.file}</span></div>
        <pre key={step} className="rc-detail-swap">
          {s.code.map((l, i) => {
            if (l.t === "gap") return <div key={i} style={{ height: 12 }} />
            if (l.t === "prop") return <div key={i}><span className="key">{l.k}:</span> <span className="val">{l.v}</span></div>
            return <div key={i} className={l.t === "plain" ? "val" : l.t}>{l.s}</div>
          })}
        </pre>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VeritasPage() {
  return (
    <div className={`rc ${inter.variable} ${geistMono.variable}`}>
      <Nav />

      {/* ── HERO ── */}
      <header className="rc-hero">
        <div className="rc-hero-art" aria-hidden="true">
          <div className="wash" />
          <div className="bar blue" />
          <div className="bar coral-1" />
          <div className="bar coral-2" />
          <div className="edge e1" />
          <div className="edge e2" />
          <div className="grain" />
          <div className="fade" />
        </div>
        <div className="rc-container">
          <div className="rc-hero-copy">
            <span className="rc-pill"><span className="rc-badge warm">NEW</span>DPDPA compliance platform · v1.0.16</span>
            <h1 className="rc-display">Stop guessing.<br />Start proving DPDPA compliance.</h1>
            <p className="rc-body-lg rc-hero-lede">
              Veritas automatically detects personal data violations in your application logs, records tamper-evident evidence, and gives your compliance team a live dashboard to investigate every case  -  entirely on your own infrastructure.
            </p>
            <div className="rc-actions">
              <Link href="/book-demo" className="rc-btn rc-btn-primary rc-btn-lg">Book a demo</Link>
              <Link href="/how-it-works" className="rc-btn rc-btn-ghost rc-btn-lg">How it works <ArrowRight size={16} /></Link>
            </div>
            <div className="rc-meta rc-mono"><span>v1.0.16</span><span>On-premise · your infra</span><span>DPDPA 2023 · India</span></div>
          </div>
          <ProductWindow />
        </div>
      </header>

      {/* ── THE PROBLEM ── */}
      <section className="rc-section">
        <div className="rc-container">
          <SectionHead
            eyebrow="The problem"
            title="DPDPA 2023 requires you to detect violations before they become breaches."
            lede="Every organisation subject to DPDPA must track where personal data goes, why it's being used, how long it's retained, and prove compliance to auditors. Doing this manually across hundreds of services is impossible."
          />
          <div className="rc-grid rc-grid-3">
            {PROBLEMS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.title} className="rc-card" delay={i * 80}>
                  <span className="rc-icon"><Icon /></span>
                  <h3 className="rc-h3">{p.title}</h3>
                  <p className="rc-small">{p.desc}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="rc-section">
        <div className="rc-container">
          <SectionHead eyebrow="Capabilities" title="Everything you need for DPDPA compliance." />
          <div className="rc-grid rc-grid-3">
            <Reveal className="rc-card warm rc-span-2">
              <span className="rc-icon"><ScanSearch /></span>
              <span className="rc-eyebrow">PII detection engine</span>
              <h3 className="rc-h3">Detects personal data in your application logs</h3>
              <p className="rc-small">Automatically scans logs and API traffic for personal data across dozens of entity types. Every detection is validated to eliminate false positives. Runs fully on your server  -  no external API calls.</p>
              <div className="rc-log" aria-label="Example log line with personal data flagged">
                <div><span className="k">level=</span>info <span className="k">svc=</span>payments-api <span className="k">route=</span>/v1/kyc/submit</div>
                <div><span className="k">name=</span><span className="pii">&quot;Priya Sharma&quot;</span><span className="tag">NAME</span> <span className="k">aadhaar=</span><span className="pii">&quot;4821 7730 1956&quot;</span><span className="tag">AADHAAR</span></div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Aadhaar", "PAN Card", "Phone Numbers", "Names", "Email", "Address"].map(t => <span key={t} className="rc-badge">{t}</span>)}
              </div>
            </Reveal>

            <Reveal className="rc-card" delay={80}>
              <span className="rc-icon"><ShieldCheck /></span>
              <span className="rc-eyebrow">Data residency</span>
              <h3 className="rc-h3">Zero data leaves your network</h3>
              <p className="rc-small">Server, evidence store, and dashboard all run on your infrastructure. No cloud dependency. The only optional egress is AI investigation  -  and it sends no raw PII.</p>
              <span className="rc-badge ok" style={{ alignSelf: "flex-start" }}>Your data. Your network. Your control.</span>
            </Reveal>

            <Reveal className="rc-card rc-span-2">
              <span className="rc-icon"><Eye /></span>
              <span className="rc-eyebrow">DPDPA rule engine</span>
              <h3 className="rc-h3">4 rules. Every violation caught.</h3>
              <div className="rc-rules">
                {RULES.map(r => (
                  <div key={r.title} className="rc-rule">
                    <div><b>{r.title}</b><span>{r.label}</span></div>
                    <span className={`rc-badge ${r.severity === "HIGH" ? "warm" : ""}`}>{r.severity}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="rc-card" delay={80}>
              <span className="rc-icon"><Link2 /></span>
              <span className="rc-eyebrow">Tamper-evident evidence</span>
              <h3 className="rc-h3">SHA-256 hash chain</h3>
              <p className="rc-small">Every verdict links to the previous via SHA-256 hash. Verify the chain at any time. Export a signed PDF audit report for regulators.</p>
              <div className="rc-log">
                <div><span className="k">verdict_hash:</span> sha256(prev + verdict)</div>
                <div><span className="k">chain_valid:</span> <span style={{ color: "var(--color-success-green)" }}>true</span></div>
              </div>
            </Reveal>

            <Reveal className="rc-card rc-span-2">
              <span className="rc-icon"><LayoutDashboard /></span>
              <span className="rc-eyebrow">Investigation dashboard</span>
              <h3 className="rc-h3">Live violations. Full case lifecycle.</h3>
              <p className="rc-small">Violations appear live via WebSocket. Open cases, investigate with optional AI explanations (no raw PII sent), annotate, and move OPEN → ACKNOWLEDGED → RESOLVED.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Live Stream", "Audit Ledger", "Agent Management", "PDF Export"].map(f => <span key={f} className="rc-badge">{f}</span>)}
              </div>
            </Reveal>

            <Reveal className="rc-card" delay={80}>
              <span className="rc-icon"><Sparkles /></span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="rc-eyebrow">Optional</span><span className="rc-badge ai">AI</span></span>
              <h3 className="rc-h3">Plain-language violation explanations</h3>
              <p className="rc-small">Connect OpenAI, Anthropic, or a local Ollama model. Get statute-referenced explanations of each violation. Raw PII never sent  -  only field names and rule text.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="rc-section">
        <div className="rc-container">
          <SectionHead eyebrow="Who it's for" title="Built for every team responsible for data compliance." />
          <div className="rc-grid rc-grid-2">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.label} className="rc-card" delay={(i % 2) * 80}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="rc-icon"><Icon /></span>
                    <span className="rc-eyebrow">{a.label}</span>
                  </div>
                  <h3 className="rc-h3">{a.title}</h3>
                  <p className="rc-small">{a.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
                    {a.badges.map(b => <span key={b} className="rc-badge">{b}</span>)}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── INSTALLATION ── */}
      <section className="rc-section">
        <div className="rc-container">
          <SectionHead eyebrow="Installation" title="From install to first violation in four steps." lede="Install the server, activate your license, point an agent at your logs, and upload your data policy." />
          <Reveal><InstallTerminal /></Reveal>
        </div>
      </section>

      {/* ── DEPLOYMENT ── */}
      <section className="rc-section">
        <div className="rc-container">
          <SectionHead
            eyebrow="Deployment"
            title="Deploys on your infrastructure."
            lede="Veritas is a licensed software package that installs directly on your existing servers. Linux, macOS, and Windows supported  -  with Kubernetes agent deployment for containerised environments."
          />
          <div className="rc-grid rc-grid-3">
            {PLATFORMS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.os} className="rc-card" delay={i * 80}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="rc-icon"><Icon /></span>
                    <div>
                      <div className="rc-h3" style={{ fontSize: 16 }}>{p.os}</div>
                      <div className="rc-mono" style={{ marginTop: 4 }}>{p.pkg}</div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <div style={{ height: 16 }} />
          <Reveal className="rc-card" delay={0}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 320px", minWidth: 0 }}>
                <span className="rc-icon"><Boxes /></span>
                <div>
                  <span className="rc-eyebrow">Kubernetes</span>
                  <p className="rc-small" style={{ marginTop: 8 }}>Deploy the Veritas Agent as a DaemonSet  -  one agent per node, log forwarding stays entirely inside your cluster.</p>
                </div>
              </div>
              <Link href="/documentation" className="rc-btn rc-btn-ghost">View installation guide <ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rc-cta">
        <div className="glow" aria-hidden="true" />
        <div className="rc-container" style={{ display: "grid", justifyItems: "center", gap: 24 }}>
          <span className="rc-eyebrow">Get started</span>
          <h2 className="rc-h2">Ready to automate<br />your DPDPA compliance?</h2>
          <p className="rc-body-lg" style={{ maxWidth: 520 }}>Book a demo and see Veritas detect a real DPDPA violation  -  from agent deployment to evidence export.</p>
          <div className="rc-actions">
            <Link href="/book-demo" className="rc-btn rc-btn-primary rc-btn-lg">Book a demo</Link>
            <Link href="/how-it-works" className="rc-btn rc-btn-ghost rc-btn-lg">How it works</Link>
            <Link href="/documentation" className="rc-btn rc-btn-ghost rc-btn-lg">Documentation</Link>
          </div>
          <div className="rc-meta rc-mono"><span>v1.0.16</span><span>Ubuntu 22.04+ · macOS 12+ · Windows 10+</span><span>sudo apt install ./veritas_1.0.16_amd64.deb</span></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="rc-footer">
        <div className="rc-container">
          <div className="rc-footer-top">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <Link href="/" className="rc-logo"><span className="rc-logo-mark" aria-hidden="true" />Veritas</Link>
              <p className="rc-small" style={{ maxWidth: 220 }}>Trustworthy AI agent orchestration. Open source.</p>
              <span className="rc-badge" style={{ justifySelf: "start" }}><Users size={12} style={{ marginRight: 6 }} />BETA</span>
            </div>
            {FOOTER_COLS.map(col => (
              <div key={col.heading}>
                <h4>{col.heading}</h4>
                <ul>
                  {col.links.map(l => (
                    <li key={l.label}>
                      {"external" in l && l.external
                        ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                        : <Link href={l.href}>{l.label}</Link>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rc-footer-bottom">
            <span className="rc-mono">© 2024 Veritas. Open-source project.</span>
            <div className="rc-meta rc-mono"><span>v1.0.16</span><span>DPDPA 2023</span><span>On-premise</span></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
