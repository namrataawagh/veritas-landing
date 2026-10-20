"use client"

import Link from "next/link"
import {
  ArrowRight, BarChart3, Blocks, Check, ChevronDown, FileText, GraduationCap, Handshake, LifeBuoy, Minus,
  Server, ShieldCheck, Workflow,
} from "lucide-react"
import { Reveal, SiteShell } from "@/components/site-shell"

// Tiers, limits and prices follow "Veritas: Business and Revenue Model" (sections 7–8).
// Agents are the only enforced limit; log volume is a fair-use guide.

type Tier = {
  name: string
  forWho: string
  price: string
  unit: string
  note?: string
  featured?: boolean
  limits: string[]
  features: { label: string; included: boolean }[]
  cta: { label: string; href: string }
}

const TIERS: Tier[] = [
  {
    name: "Pilot",
    forWho: "First evaluation on your own logs",
    price: "₹25k – ₹50k",
    unit: "for 60–90 days",
    note: "Credited to your annual licence if you convert",
    limits: ["Up to 3 agents", "Up to 5 users", "1 organisation", "Small log volume"],
    features: [
      { label: "Four core rules, evidence chain, PDF export", included: true },
      { label: "AI-assisted investigation", included: true },
      { label: "Manual backups and chain verification", included: true },
      { label: "Email support", included: true },
      { label: "Self-serve onboarding", included: true },
    ],
    cta: { label: "Start a pilot", href: "/book-demo" },
  },
  {
    name: "Starter",
    forWho: "Small teams proving compliance",
    price: "About ₹1.5 – 2 lakh",
    unit: "per year",
    limits: ["Up to 3 agents", "Up to 5 users", "1 organisation", "About 10 GB/month log volume analysed"],
    features: [
      { label: "Four core rules, evidence chain, PDF export", included: true },
      { label: "AI-assisted investigation", included: false },
      { label: "Manual backups and chain verification", included: true },
      { label: "Email support, best effort", included: true },
      { label: "Self-serve docs", included: true },
    ],
    cta: { label: "Book a Demo", href: "/book-demo" },
  },
  {
    name: "Professional",
    forWho: "Growing compliance teams",
    price: "About ₹4 – 6 lakh",
    unit: "per year",
    featured: true,
    limits: ["Up to 15 agents", "Up to 25 users", "1 organisation", "About 50 GB/month log volume analysed"],
    features: [
      { label: "Four core rules, evidence chain, PDF export", included: true },
      { label: "AI-assisted investigation", included: true },
      { label: "Scheduled backups and chain verification", included: true },
      { label: "Email support, next business day", included: true },
      { label: "Guided setup call", included: true },
    ],
    cta: { label: "Book a Demo", href: "/book-demo" },
  },
  {
    name: "Enterprise",
    forWho: "Broad coverage, regulated sectors",
    price: "From about ₹12 lakh",
    unit: "per year · multi-year options",
    limits: ["40+ agents, custom", "Unlimited users", "Multiple organisations", "Custom log volume"],
    features: [
      { label: "Four core rules, evidence chain, PDF export", included: true },
      { label: "AI-assisted investigation, with local-model setup", included: true },
      { label: "Scheduled and custom backups", included: true },
      { label: "Named contact and SLA", included: true },
      { label: "Policy mapping included", included: true },
    ],
    cta: { label: "Talk to us", href: "/contact" },
  },
]

const COMPARE: { row: string; cells: [string, string, string, string] }[] = [
  { row: "For", cells: ["First evaluation", "Small teams proving compliance", "Growing compliance teams", "Broad coverage, regulated sectors"] },
  { row: "Length", cells: ["60 to 90 days", "Annual", "Annual", "Annual, multi-year options"] },
  { row: "Agents (enforced limit)", cells: ["Up to 3", "Up to 3", "Up to 15", "40+, custom"] },
  { row: "Log volume analysed (fair-use guide)", cells: ["Small", "About 10 GB/month", "About 50 GB/month", "Custom"] },
  { row: "Organisations", cells: ["1", "1", "1", "Multiple"] },
  { row: "Users", cells: ["Up to 5", "Up to 5", "Up to 25", "Unlimited"] },
  { row: "Four core rules, evidence chain, PDF export", cells: ["Yes", "Yes", "Yes", "Yes"] },
  { row: "AI-assisted investigation", cells: ["Yes", "No", "Yes", "Yes, with local-model setup"] },
  { row: "Backups and chain verification", cells: ["Manual", "Manual", "Scheduled", "Scheduled and custom"] },
  { row: "Support", cells: ["Email", "Email, best effort", "Email, next business day", "Named contact and SLA"] },
  { row: "Onboarding", cells: ["Self-serve", "Self-serve docs", "Guided setup call", "Policy mapping included"] },
  { row: "Price", cells: ["₹25k to ₹50k, credited if you convert", "About ₹1.5 to 2 lakh / year", "About ₹4 to 6 lakh / year", "Custom, from about ₹12 lakh / year"] },
]

const LIMITS = [
  { icon: Server, title: "Agents are the real limit", body: "Each plan covers a number of monitored servers (agents), capped in your signed licence. Add more in blocks of 10 at any time." },
  { icon: BarChart3, title: "Log volume is a guide, not a cap", body: "Log volume analysed is a fair-use guideline. A usage meter in the dashboard warns you at 80%, and we talk about the right plan at renewal." },
  { icon: ShieldCheck, title: "Monitoring never stops", body: "Veritas never pauses because a quota is reached. A compliance tool with blind spots is a liability, so detection always keeps running." },
]

const ADD_ONS = [
  { icon: Workflow, title: "Onboarding and policy mapping", price: "One-time, about ₹50k – ₹1.5 lakh", body: "We list the personal data each system holds and turn it into your organisation config: fields, purposes, consent scope and retention." },
  { icon: LifeBuoy, title: "Support and SLA upgrades", price: "About 10–20% of licence value per year", body: "Faster response times, a named contact and scheduled health checks." },
  { icon: Blocks, title: "Extra agent blocks", price: "Pro-rated from your tier price", body: "More agents beyond your plan's limit, sold in blocks of 10, without changing tier." },
  { icon: FileText, title: "Annual compliance health report", price: "Fixed fee per report", body: "A yearly review of findings, trends and recommendations, written for your DPO or board." },
  { icon: GraduationCap, title: "Training and workshops", price: "Per session", body: "Sessions for developers on keeping personal data out of logs, and for compliance teams on using the dashboard." },
  { icon: Handshake, title: "Partner programme", price: "15–25% referral margin", body: "For compliance consultants, CA and law firms and managed security providers who bring us customers." },
]

const ROADMAP = ["Slack alerts", "Single sign-on", "Remediation hints", "Managed service", "Hosted lite version"]

const FAQ = [
  { q: "How is Veritas priced?", a: "An annual licence based on how many servers (agents) you monitor. Licences are signed files that expire on a date, so you renew once a year, which fits how compliance budgets already work." },
  { q: "Why start with a paid pilot?", a: "A 60 to 90 day pilot runs Veritas on your own logs, so you see real findings from your systems before committing. The pilot fee is credited against your first annual licence if you convert." },
  { q: "What happens if we go over the log volume guide?", a: "Nothing stops. Log volume is a fair-use guideline, not a hard limit. The dashboard shows a usage meter and warns at 80%, and we discuss the right plan at renewal." },
  { q: "We need more agents mid-year. What then?", a: "Add extra agents in blocks of 10, pro-rated from your tier price, without changing plan." },
  { q: "Does licensing need an internet connection?", a: "No. Veritas runs entirely on your infrastructure and the licence file is verified offline. Licences are machine-bound and renewed annually." },
  { q: "Are these final prices?", a: "They are indicative. Your quote depends on the number of agents and the onboarding scope you need. Book a demo or talk to us for an exact figure." },
]

export default function PricingPage() {
  return (
    <SiteShell>
      {/* ── Hero ── */}
      <section className="tg-section tg-price-hero">
        <div className="tg-container">
          <span className="tg-pill">Annual licence · priced by monitored servers</span>
          <h1 className="tg-display">Pricing that grows with <span className="tg-wire">your servers.</span></h1>
          <p className="tg-body">
            Pay an annual licence for the number of servers Veritas monitors. Everything runs on your own infrastructure, and every plan includes the full detection engine, all four DPDPA rules and <span className="tg-violet">tamper-evident evidence.</span>
          </p>
          <div className="tg-hero-meta">
            <span><i />Billed annually</span>
            <span><i />Start with a paid pilot</span>
            <span><i />Pilot fee credited on conversion</span>
          </div>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="tg-price-tiers-wrap">
        <div className="tg-container">
          <div className="tg-tiers">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} className={`tg-tier${t.featured ? " featured" : ""}`} delay={i * 70}>
                <div className="tg-tier-head">
                  <h2 className="tg-title">{t.name}</h2>
                  {t.featured && <span className="tg-tier-badge">Most popular</span>}
                </div>
                <p className="tg-body-sm">{t.forWho}</p>
                <div className="tg-tier-price">
                  <strong>{t.price}</strong>
                  <span>{t.unit}</span>
                </div>
                {t.note && <p className="tg-tier-note">{t.note}</p>}
                <Link href={t.cta.href} className={`tg-btn ${t.featured || t.name === "Pilot" ? "tg-btn-primary" : "tg-btn-white"}`}>
                  {t.cta.label} <ArrowRight />
                </Link>
                <ul className="tg-tier-limits">
                  {t.limits.map(l => <li key={l}>{l}</li>)}
                </ul>
                <ul className="tg-tier-features">
                  {t.features.map(f => (
                    <li key={f.label} className={f.included ? undefined : "off"}>
                      {f.included ? <Check /> : <Minus />}
                      <span>{f.label}{f.included ? "" : " (not included)"}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <p className="tg-caption tg-price-fine">Indicative prices, billed annually. Your quote depends on the number of agents and the onboarding scope.</p>
        </div>
      </section>

      {/* ── How limits work ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">How limits work</span>
            <h2 className="tg-h2">One hard limit. No blind spots.</h2>
          </Reveal>
          <div className="tg-cols-3">
            {LIMITS.map((l, i) => {
              const Icon = l.icon
              return (
                <Reveal key={l.title} className="tg-feature" delay={i * 80}>
                  <span className="ic"><Icon /></span>
                  <h3 className="tg-title">{l.title}</h3>
                  <p className="tg-body">{l.body}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Compare ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Compare plans</span>
            <h2 className="tg-h2">Everything in each plan, side by side.</h2>
          </Reveal>
          <p className="tg-caption tg-swipe-hint">Swipe sideways to compare all four plans →</p>
          <Reveal className="tg-compare-wrap">
            <table className="tg-compare">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {TIERS.map(t => <th key={t.name} scope="col" className={t.featured ? "featured" : undefined}>{t.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(r => (
                  <tr key={r.row}>
                    <th scope="row">{r.row}</th>
                    {r.cells.map((c, i) => (
                      <td key={i} className={TIERS[i].featured ? "featured" : undefined}>
                        {c === "Yes" ? <Check aria-label="Yes" className="yes" /> : c === "No" ? <Minus aria-label="No" className="no" /> : c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ── Add-ons ── */}
      <section className="tg-section">
        <div className="tg-container">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Add-ons and services</span>
            <h2 className="tg-h2">Help where you need it.</h2>
            <p className="tg-body">The hardest step is mapping what personal data each system holds. We can do it with you, and support you as you grow.</p>
          </Reveal>
          <div className="tg-addons">
            {ADD_ONS.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.title} className="tg-addon" delay={(i % 3) * 70}>
                  <span className="ic"><Icon /></span>
                  <h3 className="tg-title">{a.title}</h3>
                  <span className="tg-addon-price">{a.price}</span>
                  <p className="tg-body-sm">{a.body}</p>
                </Reveal>
              )
            })}
          </div>
          <Reveal className="tg-roadmap">
            <span className="tg-caption">On the roadmap, not yet available</span>
            <div>{ROADMAP.map(r => <span key={r} className="tg-chip">{r}</span>)}</div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="tg-section">
        <div className="tg-container tg-faq-wrap">
          <Reveal className="tg-head">
            <span className="tg-eyebrow">Pricing FAQ</span>
            <h2 className="tg-h2">Common questions.</h2>
          </Reveal>
          <div className="tg-faq">
            {FAQ.map(f => (
              <details key={f.q}>
                <summary>{f.q}<ChevronDown /></summary>
                <p className="tg-body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="tg-cta">
        <div className="tg-container">
          <h2 className="tg-h2">Start with a pilot<br />on your own logs.</h2>
          <p className="tg-body" style={{ maxWidth: 520 }}>60 to 90 days, real findings from your systems, and the fee is credited if you convert.</p>
          <div className="tg-hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/book-demo" className="tg-btn tg-btn-primary">Start a pilot <ArrowRight /></Link>
            <Link href="/contact" className="tg-btn tg-btn-text">Talk to us <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
