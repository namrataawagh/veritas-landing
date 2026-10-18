"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Inter, JetBrains_Mono } from "next/font/google"
import {
  ArrowRight, Boxes, Check, ChevronRight, Clock3, FileWarning, Fingerprint, LayoutDashboard,
  Link2, Lock, Menu, Monitor, ScanSearch, Search, Server, ShieldCheck, Sparkles, Target, Terminal, X,
} from "lucide-react"
import "./home-theme.css"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--tg-inter" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--tg-mono" })

// ─── Content ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Docs", href: "/documentation" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
]

const PROBLEMS = [
  { icon: FileWarning, title: "Personal data leaks into logs", lead: "A debug line dumps a customer record.", rest: " Without automated scanning, you'll never know  -  until an auditor finds it." },
  { icon: Target, title: "Data used beyond declared purpose", lead: "Purpose limitation violated silently.", rest: " An API call accesses fields your privacy policy doesn't permit for that service." },
  { icon: Clock3, title: "Retention windows exceeded", lead: "Every day is a fresh violation.", rest: " Data from 3 years ago sits in a system that's only allowed to keep it for 6 months." },
]

const RULES = [
  { title: "Data Exposure", severity: "HIGH", label: "Personal data in logs, debug output, API responses" },
  { title: "Purpose Violation", severity: "HIGH", label: "Data used outside its declared consent scope" },
  { title: "Retention Exceeded", severity: "MEDIUM", label: "Held past the permitted retention window" },
  { title: "Re-identification Risk", severity: "MEDIUM", label: "Harmless fields that together identify a person" },
]

const CASES = [
  { icon: FileWarning, title: "Aadhaar number in application logs", meta: "payments-api · 14:02 · OPEN" },
  { icon: Target, title: "KYC data read by marketing-sync", meta: "marketing-sync · 13:31 · ACKNOWLEDGED" },
  { icon: Clock3, title: "Retention window exceeded", meta: "crm-sync · 11:20 · RESOLVED" },
]

const AUDIENCES = [
  { icon: LayoutDashboard, label: "Compliance Officer", title: "Live violation detection", desc: "Every DPDPA violation appears on your dashboard the moment it's detected — via WebSocket live feed. Open a case, investigate with AI-assisted explanations, annotate, and resolve. Full case lifecycle in one view.", badges: ["Live Stream", "Case lifecycle"] },
  { icon: Link2, label: "DPO / Auditor", title: "Tamper-evident evidence chain", desc: "Every verdict is linked by SHA-256 hash to the previous one. The chain can be verified at any time — proving no record was altered. Export a signed PDF audit report for regulators on demand.", badges: ["Hash chain", "PDF export"] },
  { icon: Boxes, label: "Engineering Team", title: "Agent deployment and monitoring", desc: "Deploy the Veritas Agent as a Docker container, .deb package, or Kubernetes DaemonSet. Each agent appears with a heartbeat status. Revoke any agent instantly from the dashboard.", badges: ["Docker", "Kubernetes DaemonSet"] },
  { icon: Lock, label: "CTO / Security", title: "Zero data leaves your network", desc: "Everything runs on your infrastructure — server, evidence store, dashboard. No data transmitted to us. RBAC with 4 server-enforced roles. TLS by default. Machine-bound RSA-PSS licensing.", badges: ["On-premise", "RBAC"] },
]

type CodeLine = { t: "c" | "cmd" | "out" | "ok" | "url" | "gap" | "plain"; s?: string } | { t: "prop"; k: string; v: string }
const INSTALL: { tab: string; code: CodeLine[] }[] = [
  {
    tab: "Server",
    code: [
      { t: "c", s: "# Install the Veritas Server (.deb)" }, { t: "cmd", s: "sudo apt install ./veritas_1.0.16_amd64.deb" }, { t: "gap" },
      { t: "c", s: "# Get your machine fingerprint" }, { t: "cmd", s: "sudo veritas fingerprint" }, { t: "gap" },
      { t: "out", s: "v2:a3f8c2d1e9b47f6c..." }, { t: "c", s: "# Send this hash to your Veritas contact" },
    ],
  },
  {
    tab: "License",
    code: [
      { t: "c", s: "# Install your signed license file" }, { t: "cmd", s: "sudo veritas license ./veritas.vlic" }, { t: "gap" },
      { t: "ok", s: "✓ License valid" }, { t: "ok", s: "✓ Machine fingerprint matched" }, { t: "ok", s: "✓ Veritas service started" }, { t: "gap" },
      { t: "url", s: "  → Dashboard: http://localhost:8000" },
    ],
  },
  {
    tab: "Agent",
    code: [
      { t: "c", s: "# agent-config.yaml" }, { t: "prop", k: "veritas_address", v: "'https://veritas.your-company.internal'" },
      { t: "prop", k: "registration_key", v: "'KEY-FROM-DASHBOARD'" }, { t: "plain", s: "sources:" }, { t: "plain", s: "  - type: file" },
      { t: "prop", k: "    path", v: "'/var/log/your-app/*.log'" }, { t: "plain", s: "  - type: docker" }, { t: "prop", k: "    container", v: "'order-service'" },
    ],
  },
  {
    tab: "Policy",
    code: [
      { t: "prop", k: "org_id", v: "'acme_retail'" }, { t: "plain", s: "fields:" }, { t: "plain", s: "  - field_name: aadhaar" },
      { t: "prop", k: "    declared_purpose", v: "'onboarding_kyc'" }, { t: "prop", k: "    retention_days", v: "180" },
      { t: "prop", k: "    source_system", v: "'partner-service'" }, { t: "gap" }, { t: "ok", s: "✓ Policy active — violations now detected" },
    ],
  },
]

const PLATFORMS = [
  { icon: Terminal, os: "Linux", pkg: "Ubuntu 22.04+" },
  { icon: Monitor, os: "macOS", pkg: "macOS 12+ (Apple Silicon)" },
  { icon: LayoutDashboard, os: "Windows", pkg: "Windows 10/11, Server 2019+" },
  { icon: Boxes, os: "Kubernetes", pkg: "Agent as a DaemonSet" },
]

const FOOTER_COLS = [
  { heading: "Product", links: [{ label: "Overview", href: "/product" }, { label: "How It Works", href: "/how-it-works" }, { label: "Use Cases", href: "/use-cases" }] },
  { heading: "Resources", links: [{ label: "Documentation", href: "/documentation" }, { label: "Quickstart", href: "/documentation/quickstart" }, { label: "GitHub", href: "https://github.com/shreyaaassss/Veritas", external: true }] },
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
    <div ref={ref} className={`tg-reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Hero diagram: log packets flow from services into Veritas ───────────────
const C = 280
// Round so server and browser trig output render identical attributes
const r2 = (n: number) => Math.round(n * 100) / 100
const CYCLE = 4.8
const SERVICES = [
  { name: "payments-api", pii: true },
  { name: "billing-api", pii: false },
  { name: "loan-service", pii: true },
  { name: "auth-service", pii: true },
  { name: "crm-sync", pii: false },
  { name: "analytics-etl", pii: true },
]

function NetworkDiagram() {
  const [seen, setSeen] = useState(18204)
  useEffect(() => {
    const t = setInterval(() => setSeen(n => n + 1 + Math.floor(Math.random() * 3)), 800)
    return () => clearInterval(t)
  }, [])

  const R = 200
  const nodes = SERVICES.map((s, i) => {
    const a = (-60 + i * 60) * (Math.PI / 180)
    return { ...s, x: r2(C + R * Math.cos(a)), y: r2(C + R * Math.sin(a)), a, delay: r2(i * (CYCLE / SERVICES.length)) }
  })

  return (
    <div className="tg-diagram" aria-label="Diagram: log lines from six services flow into Veritas, which flags and locks the ones carrying personal data">
      <svg viewBox="0 0 560 560" role="img">
        <circle className="ring dash" cx={C} cy={C} r={258} />
        <circle className="ring" cx={C} cy={C} r={R} />
        <circle className="ring dash rev" cx={C} cy={C} r={140} />
        <circle className="ring teal" cx={C} cy={C} r={84} />
        <circle className="pulse" cx={C} cy={C} r={R} />
        <circle className="pulse p2" cx={C} cy={C} r={R} />

        {nodes.map(n => <line key={`s-${n.name}`} className="spoke" x1={n.x} y1={n.y} x2={C} y2={C} />)}

        {/* Packets travel from each service to the hub */}
        <g transform={`translate(${C} ${C})`}>
          {nodes.map(n => (
            <g
              key={`p-${n.name}`}
              className={`packet ${n.pii ? "pii" : ""}`}
              style={{ "--x": `${r2(n.x - C)}px`, "--y": `${r2(n.y - C)}px`, "--cycle": `${CYCLE}s`, "--delay": `${n.delay}s` } as React.CSSProperties}
            >
              {n.pii && <circle className="halo" r={9} />}
              <circle r={4} />
            </g>
          ))}
        </g>

        {/* Service nodes */}
        {nodes.map(n => {
          const lx = r2(C + (R + 46) * Math.cos(n.a))
          const ly = r2(C + (R + 46) * Math.sin(n.a))
          const vars = { "--cycle": `${CYCLE}s`, "--delay": `${n.delay}s` } as React.CSSProperties
          return (
            <g key={`n-${n.name}`}>
              <circle className="node-bg" cx={n.x} cy={n.y} r={24} />
              <g className="node-ic">
                <rect x={n.x - 9} y={n.y - 8} width={18} height={6} rx={1.5} />
                <rect x={n.x - 9} y={n.y + 2} width={18} height={6} rx={1.5} />
              </g>
              {n.pii && <circle className="node-ring" cx={n.x} cy={n.y} r={24} style={vars} />}
              {n.pii && (
                <g className="lock" style={vars}>
                  <circle cx={n.x + 18} cy={n.y - 18} r={10} />
                  <path d={`M${n.x + 14} ${n.y - 18.5}h8v5.5h-8z M${n.x + 15.6} ${n.y - 18.5}v-2.2a2.4 2.4 0 0 1 4.8 0v2.2`} />
                </g>
              )}
              <text className="node-label" x={lx} y={ly + 4} textAnchor={Math.abs(Math.cos(n.a)) < 0.2 ? "middle" : Math.cos(n.a) > 0 ? "start" : "end"}>{n.name}</text>
            </g>
          )
        })}

        {/* Veritas hub */}
        <polygon className="hub-bg" points={[0, 1, 2, 3, 4, 5].map(i => { const a = (i * 60 - 90) * Math.PI / 180; return `${r2(C + 52 * Math.cos(a))},${r2(C + 52 * Math.sin(a))}` }).join(" ")} />
        <g className="hub-ic" transform={`translate(${C - 16} ${C - 16}) scale(1.333)`}>
          <path d="M12 2.5 20 6v6c0 4.6-3.3 8.4-8 9.5C7.3 20.4 4 16.6 4 12V6l8-3.5Z" />
          <path d="m8.5 12 2.4 2.4 4.6-4.8" />
        </g>
        <g className="hub-check">
          <circle cx={C + 36} cy={C - 32} r={11} />
          <path d={`M${C + 31} ${C - 32}l3.4 3.4 6-6.4`} />
        </g>
      </svg>
      <div className="tg-float" aria-live="off">
        <span className="dot" />
        <strong>{seen.toLocaleString("en-IN")}</strong>
        <span>log lines inspected today<br />on your own servers</span>
      </div>
    </div>
  )
}

// ─── Product showcase mockups ────────────────────────────────────────────────
function DetectionMock() {
  const [masked, setMasked] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setMasked(m => !m), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>payments-api · app.log</b><span><i className="live" />Scanning</span></div>
      <div className="tg-ui-body">
        <div className="tg-log">
          <div><span className="k">level=</span>info <span className="k">route=</span>/v1/kyc/submit</div>
          <div><span className="k">name=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? '"P•••• S•••••"' : '"Priya Sharma"'}</span><span className="tag">NAME</span></div>
          <div><span className="k">aadhaar=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? '"XXXX XXXX 1956"' : '"4821 7730 1956"'}</span><span className="tag">AADHAAR</span></div>
          <div><span className="k">phone=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? '"+91 •••• •4517"' : '"+91 98201 44517"'}</span><span className="tag">PHONE</span></div>
          <div><span className="k">loan_amt=</span>250000</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Aadhaar", "PAN Card", "Phone Numbers", "Names", "Email", "Address"].map(t => <span key={t} className="tg-chip">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

function RulesMock() {
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>DPDPA rule engine</b><span>4 rules active</span></div>
      <div className="tg-ui-body">
        {RULES.map(r => (
          <div key={r.title} className="tg-item">
            <span className="av"><ShieldCheck /></span>
            <div style={{ minWidth: 0 }}><p>{r.title}</p><small>{r.label}</small></div>
            <span className={`tg-chip ${r.severity === "HIGH" ? "high" : ""}`}>{r.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CasesMock() {
  const [on, setOn] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setOn(i => (i + 1) % CASES.length), 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>Investigation dashboard</b><span><i className="live" />Live</span></div>
      <div className="tg-ui-body">
        <div className="tg-input"><Search /><span>Search cases, services, fields</span></div>
        {CASES.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={c.title} className={`tg-item ${i === on ? "on" : ""}`}>
              <span className="av"><Icon /></span>
              <div style={{ minWidth: 0 }}><p>{c.title}</p><small>{c.meta}</small></div>
              <ChevronRight size={16} color="var(--color-smoke)" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChainMock() {
  const blocks = [
    { n: "#00412", h: "9f2c41…e8a71e" },
    { n: "#00411", h: "4bca07…31c441" },
    { n: "#00410", h: "af3e92…0d2b3b" },
  ]
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>Evidence chain</b><span style={{ color: "var(--color-circuit-teal)" }}><Check size={14} />chain_valid: true</span></div>
      <div className="tg-ui-body">
        <div className="tg-chain">
          {blocks.map((b, i) => (
            <React.Fragment key={b.n}>
              {i > 0 && <div className="tg-link-line" />}
              <div className="tg-block"><Link2 size={14} color="var(--color-circuit-teal)" /><span><b>{b.n}</b> verdict_hash</span><span>{b.h}</span></div>
            </React.Fragment>
          ))}
        </div>
        <div className="tg-input" style={{ justifyContent: "space-between" }}><span>Signed PDF audit report</span><span className="tg-chip">Export</span></div>
      </div>
    </div>
  )
}

// ─── Install tabs ────────────────────────────────────────────────────────────
function InstallCode() {
  const [tab, setTab] = useState(0)
  const s = INSTALL[tab]
  return (
    <div className="tg-code">
      <div className="tg-tabs" role="tablist" aria-label="Installation steps">
        {INSTALL.map((it, i) => (
          <button key={it.tab} role="tab" aria-selected={i === tab} className="tg-tab" onClick={() => setTab(i)}>{i + 1}. {it.tab}</button>
        ))}
      </div>
      <pre key={tab} className="tg-swap" role="tabpanel">
        {s.code.map((l, i) => {
          if (l.t === "gap") return <div key={i} style={{ height: 12 }} />
          if (l.t === "prop") return <div key={i}><span className="key">{l.k}:</span> <span className="val">{l.v}</span></div>
          return <div key={i} className={l.t === "plain" ? "val" : l.t}>{l.s}</div>
        })}
      </pre>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VeritasPage() {
  const [menu, setMenu] = useState(false)

  return (
    <div className={`tg ${inter.variable} ${mono.variable}`}>

      {/* ── Header ── */}
      <header className="tg-header">
        <div className="tg-container">
          <nav className="tg-nav" aria-label="Main">
            <Link href="/" className="tg-logo" aria-label="Veritas home"><img src="/veritas-wordmark.png" alt="Veritas" width={1726} height={375} /></Link>
            <div className="tg-nav-links">
              {NAV_LINKS.map(l => <Link key={l.label} href={l.href}>{l.label}</Link>)}
            </div>
            <div className="tg-nav-actions">
              <Link href="/contact" className="tg-btn tg-btn-text">Contact</Link>
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
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="tg-hero">
        <div className="tg-container tg-hero-grid">
          <div className="tg-hero-copy">
            <Link href="/documentation/quickstart" className="tg-pill">New: on-premise DPDPA compliance <ChevronRight /></Link>
            <h1 className="tg-display">Stop guessing.<br />Start proving<br />DPDPA <span className="tg-wire">compliance.</span></h1>
            <p className="tg-body">
              Veritas automatically detects personal data violations in your application logs, records <span className="tg-violet">tamper-evident evidence</span>, and gives your compliance team a live dashboard to investigate every case  -  entirely on your own infrastructure.
            </p>
            <div className="tg-hero-actions">
              <Link href="/book-demo" className="tg-btn tg-btn-primary">Book a Demo <ArrowRight /></Link>
              <Link href="/how-it-works" className="tg-btn tg-btn-text">How It Works <ArrowRight /></Link>
            </div>
            <div className="tg-hero-meta">
              <span><i />v1.0.16 latest release</span>
              <span><i />On-premise, your infra</span>
              <span><i />DPDPA 2023, India</span>
            </div>
          </div>
          <NetworkDiagram />
        </div>
      </section>

      {/* ── Entity strip ── */}
      <section className="tg-strip" aria-label="Personal data Veritas detects">
        <div className="tg-container">
          <span className="tg-caption">Detects personal data across dozens of entity types, including</span>
          <div className="tg-strip-row">
            {["Aadhaar", "PAN", "Phone", "Email", "Names", "Address", "Bank A/C", "DOB"].map(e => <span key={e}>{e}</span>)}
          </div>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">The problem</span>
            <h2 className="tg-h2">DPDPA 2023 requires you to detect violations before they become breaches.</h2>
            <p className="tg-body">Every organisation subject to DPDPA must track where personal data goes, why it&apos;s being used, how long it&apos;s retained, and prove compliance to auditors. Doing this manually across hundreds of services is impossible.</p>
          </Reveal>
          <div className="tg-cols-3">
            {PROBLEMS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.title} className="tg-feature" delay={i * 80}>
                  <span className="ic"><Icon /></span>
                  <h3 className="tg-title">{p.title}</h3>
                  <p className="tg-body"><span className="tg-violet">{p.lead}</span>{p.rest}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Capabilities</span>
            <h2 className="tg-h2">Everything you need for DPDPA compliance.</h2>
          </Reveal>
          <div className="tg-rows">
            <Reveal className="tg-row">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">PII detection engine</span>
                <h3 className="tg-h3">Detects personal data in your application logs</h3>
                <p className="tg-body">Automatically scans logs and API traffic for personal data across dozens of entity types. Every detection is validated to eliminate false positives. <span className="tg-violet">Runs fully on your server  -  no external API calls.</span></p>
                <ul>
                  <li><ScanSearch /><div><b>Logs and API traffic</b><span>File, Docker and Kubernetes log sources</span></div></li>
                  <li><ShieldCheck /><div><b>Zero data leaves your network</b><span>The only optional egress is AI investigation, and it sends no raw PII</span></div></li>
                </ul>
                <Link href="/product" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase"><DetectionMock /></div>
            </Reveal>

            <Reveal className="tg-row flip">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">DPDPA rule engine</span>
                <h3 className="tg-h3">4 rules. Every violation caught.</h3>
                <p className="tg-body">Define your data policy once in YAML, with each field&apos;s declared purpose, retention window and source system. <span className="tg-violet">No code change needed.</span></p>
                <ul>
                  <li><Target /><div><b>Purpose limitation</b><span>Flags data used in a system its consent scope doesn&apos;t permit</span></div></li>
                  <li><Fingerprint /><div><b>Re-identification risk</b><span>Catches harmless fields that together identify a person</span></div></li>
                </ul>
                <Link href="/how-it-works" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase violet"><RulesMock /></div>
            </Reveal>

            <Reveal className="tg-row">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Investigation dashboard</span>
                <h3 className="tg-h3">Live violations. Full case lifecycle.</h3>
                <p className="tg-body">Violations appear live via WebSocket. Open cases, investigate with optional AI explanations (no raw PII sent), annotate, and move <span className="tg-violet">OPEN → ACKNOWLEDGED → RESOLVED.</span></p>
                <ul>
                  <li><Sparkles /><div><b>Optional AI explanations</b><span>OpenAI, Anthropic or a local Ollama model. Only field names and rule text are sent</span></div></li>
                  <li><LayoutDashboard /><div><b>Live Stream, Audit Ledger, Agent Management, PDF Export</b><span>One dashboard for the whole compliance team</span></div></li>
                </ul>
                <Link href="/product" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase"><CasesMock /></div>
            </Reveal>

            <Reveal className="tg-row flip">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Tamper-evident evidence</span>
                <h3 className="tg-h3">SHA-256 hash chain</h3>
                <p className="tg-body">Every verdict links to the previous via SHA-256 hash. Verify the chain at any time. <span className="tg-violet">Export a signed PDF audit report for regulators.</span></p>
                <Link href="/security" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase violet"><ChainMock /></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="tg-section">
        <div className="tg-container">
          <div className="tg-stats">
            {[
              { n: "4", t: "DPDPA rules enforced on every log line: exposure, purpose, retention and re-identification." },
              { n: "0", t: "bytes of raw personal data sent outside your network. Server, evidence store and dashboard run on your infrastructure." },
              { n: "4", t: "server-enforced RBAC roles, with TLS by default and machine-bound RSA-PSS licensing." },
            ].map((s, i) => (
              <Reveal key={i} className="tg-stat" delay={i * 80}>
                <strong>{s.n}</strong>
                <p className="tg-body">{s.t}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance as code ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Installation</span>
            <h2 className="tg-h2">Compliance as code, from install to first violation.</h2>
          </Reveal>
          <Reveal className="tg-code-wrap">
            <InstallCode />
            <div className="tg-side">
              <h3 className="tg-title">Four steps on your own servers</h3>
              <p className="tg-body">Install the server on Ubuntu 22.04+, activate your machine-bound license, deploy one agent per application server, and upload your org config. <span className="tg-violet">Policy changes need no code change.</span></p>
              <Link href="/documentation/quickstart" className="tg-btn tg-btn-outline" style={{ justifySelf: "start" }}>Open the quickstart <ArrowRight /></Link>
              <Link href="/documentation" className="tg-link violet">Explore the documentation <ChevronRight /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Who it&apos;s for</span>
            <h2 className="tg-h2">Built for every team responsible for data compliance.</h2>
          </Reveal>
          <div className="tg-cards">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.label} className="tg-card" delay={(i % 2) * 80}>
                  <div className="who"><span className="av"><Icon /></span><div><b>{a.title}</b><span>{a.label}</span></div></div>
                  <p className="tg-body">{a.desc}</p>
                  <div className="chips">{a.badges.map(b => <span key={b} className="tg-chip">{b}</span>)}</div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Deployment ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Deployment</span>
            <h2 className="tg-h2">Deploys on your infrastructure.</h2>
            <p className="tg-body">Veritas is a licensed software package that installs directly on your existing servers. Linux, macOS, and Windows supported  -  with Kubernetes agent deployment for containerised environments.</p>
          </Reveal>
          <div className="tg-platforms">
            {PLATFORMS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.os} className="tg-platform" delay={i * 60}>
                  <Icon />
                  <b>{p.os}</b>
                  <span className="tg-body-sm">{p.pkg}</span>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="tg-cta">
        <div className="tg-container">
          <h2 className="tg-h2">Ready to automate<br />your DPDPA compliance?</h2>
          <p className="tg-body" style={{ maxWidth: 520 }}>Book a demo and see Veritas detect a real DPDPA violation  -  from agent deployment to evidence export.</p>
          <div className="tg-hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/book-demo" className="tg-btn tg-btn-primary">Book a Demo <ArrowRight /></Link>
            <Link href="/how-it-works" className="tg-btn tg-btn-text">How It Works <ArrowRight /></Link>
            <Link href="/documentation" className="tg-btn tg-btn-text">Documentation <ArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="tg-footer">
        <div className="tg-container">
          <div className="tg-footer-top">
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <Link href="/" className="tg-logo" aria-label="Veritas home"><img src="/veritas-wordmark.png" alt="Veritas" width={1726} height={375} /></Link>
              <p className="tg-body-sm" style={{ maxWidth: 240 }}>Trustworthy AI agent orchestration. Open source.</p>
              <span className="tg-pill" style={{ justifySelf: "start" }}>BETA</span>
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
            {PLATFORMS.map(p => <span key={p.os} className="tg-chip"><Server size={12} style={{ marginRight: 6 }} />{p.os}</span>)}
          </div>
          <div className="tg-footer-bottom">
            <span className="tg-caption">© 2024 Veritas. Open-source project.</span>
            <span className="tg-caption tg-mono">v1.0.16</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
