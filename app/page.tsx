"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, Boxes, Check, ChevronRight, Clock3, FileWarning, Fingerprint, LayoutDashboard, Link2,
  Lock, ScanSearch, Search, ShieldCheck, Target,
} from "lucide-react"
import { DownloadButtons } from "@/components/download-buttons"
import { Reveal, SiteShell } from "@/components/site-shell"

// ─── Content ──────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { icon: FileWarning, title: "Personal data leaks into logs", lead: "One debug line can carry a customer record.", rest: " Nobody chose to log it, and nobody is watching the file it lands in." },
  { icon: Target, title: "Data turns up where nobody declared it", lead: "A new column, an API field, a second system.", rest: " The policy says one thing while the systems quietly do another." },
  { icon: Fingerprint, title: "Screenshots are not evidence", lead: "Someone will ask what you saw and what you did.", rest: " A spreadsheet can be edited after the fact. A record needs to show that it was not." },
]

const RULES = [
  { title: "Personal data where it should not be", severity: "BY DATA KIND", label: "Logs, and systems declared to hold none" },
  { title: "Data without a matching declaration", severity: "BY DATA KIND", label: "Fields, columns and API responses the policy never named" },
  { title: "Held longer than declared", severity: "BY DATA KIND", label: "Still seen after its declared retention period" },
  { title: "An erased identifier came back", severity: "HIGH", label: "Seen again after an erasure request was closed" },
]

const CASES = [
  { icon: FileWarning, title: "Aadhaar and phone in support logs", meta: "support-ticketing · Support team · OPEN" },
  { icon: Target, title: "Undeclared column customers.aadhaar_no", meta: "loan-db · schema change · OPEN" },
  { icon: Clock3, title: "Resolved debug line came back", meta: "payments-service · Platform team · RECURRED" },
]

const AUDIENCES = [
  { icon: LayoutDashboard, label: "DPO and compliance team", title: "Incidents with owners, not alerts", desc: "Thousands of findings collapse into a short list of incidents, each routed to the team that owns the system. Rights requests, retention reviews and notice coverage are tracked against the policy you declared.", badges: ["Owned incidents", "Rights requests"] },
  { icon: Link2, label: "Auditors and customers", title: "Evidence they can check themselves", desc: "Every record is chained to the one before it, and signed checkpoints are kept by witnesses outside the server. The audit pack verifies offline with a stand-alone tool and states plainly what it does not prove.", badges: ["Signed checkpoints", "Audit pack"] },
  { icon: Boxes, label: "Engineering team", title: "Stopped at the source and in the pipeline", desc: "Agents read files, containers and syslog on each host and mask personal data before a line leaves it. A pipeline gate fails a migration or API spec that adds undeclared personal data, before it ships.", badges: ["Masking at source", "Pipeline gate"] },
  { icon: Lock, label: "CTO and security", title: "Runs entirely on your infrastructure", desc: "Server, evidence store and dashboard run on your own machines, on Linux, macOS or Windows. Roles are enforced on the server, traffic uses TLS, and the machine-bound licence is verified offline.", badges: ["Self-hosted", "Offline licence"] },
]

type CodeLine = { t: "c" | "cmd" | "out" | "ok" | "url" | "gap" | "plain"; s?: string } | { t: "prop"; k: string; v: string }
const INSTALL: { tab: string; code: CodeLine[] }[] = [
  {
    tab: "Server",
    code: [
      { t: "c", s: "# Install the Veritas server (Ubuntu or Debian)" }, { t: "cmd", s: "sudo apt install ./veritas_<version>_amd64.deb" }, { t: "gap" },
      { t: "c", s: "# Print this machine's fingerprint" }, { t: "cmd", s: "sudo veritas fingerprint" }, { t: "gap" },
      { t: "out", s: "v2:a3f8c2d1e9b47f6c..." }, { t: "c", s: "# Send it to your Veritas contact for a licence" },
    ],
  },
  {
    tab: "License",
    code: [
      { t: "c", s: "# Install the signed licence file" }, { t: "cmd", s: "sudo veritas license ./veritas.vlic" }, { t: "gap" },
      { t: "ok", s: "Licence valid for this machine" }, { t: "ok", s: "Veritas service started" }, { t: "gap" },
      { t: "url", s: "  Dashboard: https://localhost:8000" },
    ],
  },
  {
    tab: "Agent",
    code: [
      { t: "c", s: "# /etc/veritas-agent/config.yaml" }, { t: "prop", k: "veritas_address", v: "'https://veritas.your-company.internal:8000'" },
      { t: "prop", k: "registration_key", v: "'KEY-FROM-DASHBOARD'" }, { t: "plain", s: "sources:" }, { t: "plain", s: "  - type: file" },
      { t: "prop", k: "    path", v: "'/var/log/app/application.log'" }, { t: "prop", k: "    source_system", v: "'support-ticketing'" },
      { t: "plain", s: "redaction:" }, { t: "prop", k: "  categories", v: "{ aadhaar: mask, phone: hash, email: mask }" },
    ],
  },
  {
    tab: "Policy",
    code: [
      { t: "prop", k: "org_id", v: "'acme_retail'" }, { t: "plain", s: "fields:" }, { t: "plain", s: "  - field_name: aadhaar" },
      { t: "prop", k: "    declared_purpose", v: "'onboarding_kyc'" }, { t: "prop", k: "    retention_days", v: "180" },
      { t: "prop", k: "    source_system", v: "'partner-service'" }, { t: "gap" }, { t: "ok", s: "Policy active. Every finding is checked against it." },
    ],
  },
]

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
  const R = 200
  const nodes = SERVICES.map((s, i) => {
    const a = (-60 + i * 60) * (Math.PI / 180)
    return { ...s, x: r2(C + R * Math.cos(a)), y: r2(C + R * Math.sin(a)), a, delay: r2(i * (CYCLE / SERVICES.length)) }
  })

  return (
    <div className="tg-diagram" aria-label="Diagram: log lines from your services flow into Veritas, which masks and locks the ones carrying personal data">
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
      <div className="tg-ui-head"><b>support-ticketing · on the host</b><span><i className="live" />{masked ? "Masked" : "Raw line"}</span></div>
      <div className="tg-ui-body">
        <div className="tg-log">
          <div><span className="k">level=</span>info <span className="k">ticket=</span>5001</div>
          <div><span className="k">callback=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? "[PHONE#69512b…]" : "9876543210"}</span><span className="tag">PHONE</span></div>
          <div><span className="k">aadhaar=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? "[AADHAAR_REDACTED]" : "2345 6789 0124"}</span><span className="tag">AADHAAR</span></div>
          <div><span className="k">mail=</span><span className={`hit ${masked ? "masked" : ""}`}>{masked ? "[EMAIL_REDACTED]" : "asha.rao@example.com"}</span><span className="tag">EMAIL</span></div>
          <div><span className="k">status=</span>done</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Mask", "Hash", "Drop", "Fail closed"].map(t => <span key={t} className="tg-chip">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

function RulesMock() {
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>Rules in force</b><span>Two-person approval</span></div>
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
      <div className="tg-ui-head"><b>Audit Ledger · incidents</b><span><i className="live" />Live</span></div>
      <div className="tg-ui-body">
        <div className="tg-input"><Search /><span>Search incidents, systems, owners</span></div>
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
    { n: "#11356", h: "9f2c41…e8a71e" },
    { n: "#11355", h: "4bca07…31c441" },
    { n: "#11354", h: "af3e92…0d2b3b" },
  ]
  return (
    <div className="tg-ui">
      <div className="tg-ui-head"><b>Evidence chain</b><span style={{ color: "var(--color-circuit-teal)" }}><Check size={14} />verified offline</span></div>
      <div className="tg-ui-body">
        <div className="tg-chain">
          {blocks.map((b, i) => (
            <React.Fragment key={b.n}>
              {i > 0 && <div className="tg-link-line" />}
              <div className="tg-block"><Link2 size={14} color="var(--color-circuit-teal)" /><span><b>{b.n}</b> record hash</span><span>{b.h}</span></div>
            </React.Fragment>
          ))}
        </div>
        <div className="tg-input" style={{ justifyContent: "space-between" }}><span>Signed checkpoint, held by two witnesses</span><span className="tg-chip">Witnessed</span></div>
        <div className="tg-input" style={{ justifyContent: "space-between" }}><span>Evidence, checkpoints and verifier</span><span className="tg-chip">Audit pack</span></div>
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
  return (
    <SiteShell>

      {/* ── Hero ── */}
      <section className="tg-hero">
        <div className="tg-container tg-hero-grid">
          <div className="tg-hero-copy">
            <Link href="/how-it-works" className="tg-pill">New: evidence you can verify offline <ChevronRight /></Link>
            <h1 className="tg-display">Find personal data<br />at the source.<br />Prove what you <span className="tg-wire">did.</span></h1>
            <p className="tg-body">
              Veritas finds personal data in your logs, API responses and database changes, masks it on the host before it travels, and turns findings into incidents with owners. Every step is kept in a <span className="tg-violet">tamper-evident record</span> that an auditor can verify without trusting us, all on your own infrastructure.
            </p>
            <div className="tg-hero-actions">
              <Link href="/book-demo" className="tg-btn tg-btn-primary">Book a Demo <ArrowRight /></Link>
              <Link href="/how-it-works" className="tg-btn tg-btn-text">How It Works <ArrowRight /></Link>
            </div>
            <div className="tg-hero-meta">
              <span><i />Masked before it leaves the host</span>
              <span><i />Verifiable without our servers</span>
              <span><i />Built for India&apos;s DPDP Act</span>
            </div>
          </div>
          <NetworkDiagram />
        </div>
      </section>

      {/* ── Entity strip ── */}
      <section className="tg-strip" aria-label="Personal data Veritas detects">
        <div className="tg-container">
          <span className="tg-caption">Finds and masks Indian and global identifiers, including</span>
          <div className="tg-strip-row">
            {["Aadhaar", "PAN", "Phone numbers", "Email addresses", "Card numbers"].map(e => <span key={e}>{e}</span>)}
          </div>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">The problem</span>
            <h2 className="tg-h2">Personal data spreads faster than any policy document can track.</h2>
            <p className="tg-body">Every team that handles Indian personal data needs to know where it flows, whether that matches what was declared, how long it stays, and what was done when something went wrong. Across dozens of services, a manual review cannot keep up, and a spreadsheet cannot show that it was never changed.</p>
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
            <h2 className="tg-h2">From the first log line to evidence an outsider can check.</h2>
          </Reveal>
          <div className="tg-rows">
            <Reveal className="tg-row">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Masking at the source</span>
                <h3 className="tg-h3">Masked on the host, before a line travels</h3>
                <p className="tg-body">Agents read application logs, containers and syslog, and mask, hash or drop each kind of personal data on the host itself. <span className="tg-violet">If masking ever fails, the line is dropped, not sent.</span></p>
                <ul>
                  <li><ScanSearch /><div><b>Logs, APIs and database changes</b><span>File, container, syslog and OpenTelemetry sources, a payload tap for API responses, and schema watch for databases</span></div></li>
                  <li><ShieldCheck /><div><b>Keyed hashes, not raw values</b><span>Lookups and erasure checks run on keyed hashes, so the raw identifier is never stored</span></div></li>
                </ul>
                <Link href="/product" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase"><DetectionMock /></div>
            </Reveal>

            <Reveal className="tg-row flip">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Rules and approvals</span>
                <h3 className="tg-h3">Rules that say exactly what they are</h3>
                <p className="tg-body">Declare each system&apos;s personal data, purpose, owner and retention once. Every rule describes a possible control failure in plain language: a technical signal, not a legal conclusion. <span className="tg-violet">Core rules cannot be switched off, severity cannot fall below its floor, and every change needs a second person&apos;s approval.</span></p>
                <ul>
                  <li><Target /><div><b>Declared versus observed</b><span>Flags personal data in a system, column or API that your policy never declared</span></div></li>
                  <li><Fingerprint /><div><b>Erasure that does not hold</b><span>Raises an alert when an identifier from a closed erasure request appears again</span></div></li>
                </ul>
                <Link href="/how-it-works" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase violet"><RulesMock /></div>
            </Reveal>

            <Reveal className="tg-row">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Incidents, not noise</span>
                <h3 className="tg-h3">Thousands of findings, one short list with owners</h3>
                <p className="tg-body">Findings with the same cause become a single incident, routed to the team that owns the system. Nothing is discarded, and every finding stays one click away. <span className="tg-violet">Resolve an incident, and Veritas reopens it if the fix does not hold.</span></p>
                <ul>
                  <li><LayoutDashboard /><div><b>Observed processing map</b><span>What Veritas has actually seen in each system, set against what you declared</span></div></li>
                  <li><Search /><div><b>Rights requests</b><span>Look up an identifier across systems, give each owner a task, and close with a signed record</span></div></li>
                </ul>
                <Link href="/product" className="tg-link">Learn more <ChevronRight /></Link>
              </div>
              <div className="tg-showcase"><CasesMock /></div>
            </Reveal>

            <Reveal className="tg-row flip">
              <div className="tg-row-copy">
                <span className="tg-eyebrow">Evidence an outsider can verify</span>
                <h3 className="tg-h3">A record no one can quietly edit</h3>
                <p className="tg-body">Every record is chained to the one before it with SHA-256, and signed checkpoints are kept by witnesses outside the server: a separate folder, your SIEM or a time-stamp authority. <span className="tg-violet">A stand-alone verifier checks the evidence against them with no server, no network and no trust in us.</span></p>
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
              { n: "At source", t: "Personal data is masked, hashed or dropped on the host before a line travels. If masking fails, the line is dropped." },
              { n: "Offline", t: "The evidence verifies with a stand-alone tool against checkpoints held outside the server. No server, network or trust in us required." },
              { n: "Two keys", t: "Rule changes and exceptions take effect only after a second person approves them, and every approval is recorded in the chain." },
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
            <h2 className="tg-h2">From install to first finding, on your own servers.</h2>
          </Reveal>
          <Reveal className="tg-code-wrap">
            <InstallCode />
            <div className="tg-side">
              <h3 className="tg-title">A short path on your own servers</h3>
              <p className="tg-body">Install the server on Linux, macOS or Windows, activate your machine-bound licence, place an agent on each application host, and declare your data policy. <span className="tg-violet">Policy changes need no code change and no restart.</span></p>
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
            <h2 className="tg-h2">Built for everyone who answers for personal data.</h2>
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

      {/* ── Download ── */}
      <section className="tg-section" id="download">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Download</span>
            <h2 className="tg-h2">Deploys on your infrastructure.</h2>
            <p className="tg-body">Veritas is licensed software that installs directly on your existing servers. Pick your operating system and we will email you the installation guide, including Kubernetes deployment for containerised environments.</p>
          </Reveal>
          <DownloadButtons />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="tg-cta">
        <div className="tg-container">
          <h2 className="tg-h2">See it run on<br />your own logs.</h2>
          <p className="tg-body" style={{ maxWidth: 520 }}>Book a demo and watch Veritas mask personal data at the source, turn it into owned incidents, and hand an auditor evidence they can verify on their own.</p>
          <div className="tg-hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/book-demo" className="tg-btn tg-btn-primary">Book a Demo <ArrowRight /></Link>
            <Link href="/how-it-works" className="tg-btn tg-btn-text">How It Works <ArrowRight /></Link>
            <Link href="/documentation" className="tg-btn tg-btn-text">Documentation <ArrowRight /></Link>
          </div>
        </div>
      </section>

    </SiteShell>
  )
}
