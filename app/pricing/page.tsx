"use client"

import React, { useRef, useEffect, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { VeritasFooter } from "@/components/veritas-footer"
import { RevealText } from "@/components/reveal-text"
import { PixelIcon } from "@/components/pixel-icon"
import Link from "next/link"

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function BentoCard({ children, className = "", delay = 0, highlight = false }: { children: React.ReactNode; className?: string; delay?: number; highlight?: boolean }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref}
      className={`rounded-2xl border overflow-hidden transition-colors ${highlight ? "border-[#eef35f]/40 bg-[#21223a] text-white" : "border-white/[0.09] bg-[#0e0f11]"} ${className}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

function Tag({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest ${light ? "text-white/40 bg-white/[0.08]" : "text-white/55 bg-white/[0.06]"}`}>{children}</span>
}

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small teams getting compliant",
    agents: "1 Agent",
    telemetry: "Up to 5 GB telemetry / month",
    setup: "$2,500",
    setupNote: "one-time setup and licensing fee",
    annual: "$4,800",
    annualNote: "per year (billed annually)",
    monthly: "$400",
    highlight: false,
    delay: 0,
    icon: "platform" as const,
    features: [
      "1 Veritas Agent deployment",
      "Up to 5 GB telemetry ingested per month",
      "Full PII detection engine",
      "All 4 DPDPA compliance rules",
      "SHA-256 tamper-evident evidence chain",
      "Investigation dashboard (all 7 views)",
      "PDF audit report export",
      "Email support",
      "1 organisation",
      "Up to 5 users (RBAC)",
    ],
    notIncluded: ["Multi-organisation support", "Priority support SLA", "Custom onboarding"],
    cta: "Book a Demo",
    ctaHref: "/book-demo",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing compliance teams",
    agents: "5 Agents",
    telemetry: "Up to 25 GB telemetry / month",
    setup: "$6,000",
    setupNote: "one-time setup and licensing fee",
    annual: "$18,000",
    annualNote: "per year (billed annually)",
    monthly: "$1,500",
    highlight: true,
    delay: 80,
    icon: "workflow" as const,
    features: [
      "5 Veritas Agent deployments",
      "Up to 25 GB telemetry ingested per month",
      "Full PII detection engine",
      "All 4 DPDPA compliance rules",
      "SHA-256 tamper-evident evidence chain",
      "Investigation dashboard (all 7 views)",
      "PDF audit report export",
      "Kubernetes DaemonSet agent support",
      "Up to 3 organisations",
      "Up to 20 users (RBAC)",
      "Priority email support (48 h SLA)",
      "Assisted onboarding session (2 h)",
    ],
    notIncluded: ["Custom integrations", "Dedicated support engineer"],
    cta: "Book a Demo",
    ctaHref: "/book-demo",
  },
  {
    id: "business",
    name: "Business",
    tagline: "For enterprises with broad coverage",
    agents: "Up to 10 Agents",
    telemetry: "Up to 100 GB telemetry / month",
    setup: "$12,000",
    setupNote: "one-time setup and licensing fee",
    annual: "$48,000",
    annualNote: "per year (billed annually)",
    monthly: "$4,000",
    highlight: false,
    delay: 160,
    icon: "integrations" as const,
    features: [
      "Up to 10 Veritas Agent deployments",
      "Up to 100 GB telemetry ingested per month",
      "Full PII detection engine",
      "All 4 DPDPA compliance rules",
      "SHA-256 tamper-evident evidence chain",
      "Investigation dashboard (all 7 views)",
      "PDF audit report export",
      "Kubernetes DaemonSet agent support",
      "Unlimited organisations",
      "Unlimited users (RBAC)",
      "Priority support (24 h SLA)",
      "Dedicated onboarding (4 h)",
      "Quarterly compliance review call",
    ],
    notIncluded: ["Dedicated support engineer", "Custom SLA"],
    cta: "Book a Demo",
    ctaHref: "/book-demo",
  },
]

export default function PricingPage() {
  const [billingNote, setBillingNote] = useState(false)

  return (
    <div className="bg-black text-white min-h-screen font-sans antialiased">
      <MobileNav />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <Tag>PRICING</Tag>
          <RevealText className="mt-5 text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.02]">
            {"Simple pricing.\nNo surprises."}
          </RevealText>
          <p className="mt-8 text-base text-white/60 leading-relaxed max-w-xl">
            Every tier includes a one-time setup and licensing fee, then an annual subscription. All plans include the full Veritas compliance platform - deployed on your own infrastructure.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { dot: "#00cbaa", label: "On-premise deployment" },
              { dot: "#b6abff", label: "Annual billing" },
              { dot: "#eef35f", label: "Full platform included" },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
                <span className="text-sm text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-8 pb-24 px-6 md:px-12 lg:px-20 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">

          {/* Popular badge */}
          <div className="hidden md:flex justify-center mb-3">
            <div className="grid grid-cols-3 gap-3 w-full">
              <div />
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-[#eef35f] text-black text-[10px] tracking-widest">MOST POPULAR</span>
              </div>
              <div />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TIERS.map((tier) => (
              <BentoCard key={tier.id} className="flex flex-col" delay={tier.delay} highlight={tier.highlight}>
                <div className="p-8 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="mb-3">
                      <PixelIcon type={tier.icon} size={32} />
                    </div>
                    <div className={`font-pixel text-[10px] tracking-widest mb-2 ${tier.highlight ? "text-white/35" : "text-white/40"}`}>{tier.agents.toUpperCase()} - {tier.telemetry.split(" ")[0].toUpperCase() + " " + tier.telemetry.split(" ").slice(1).join(" ").toUpperCase()}</div>
                    <h2 className={`text-2xl font-light mb-1 ${tier.highlight ? "text-white" : "text-white"}`}>{tier.name}</h2>
                    <p className={`text-sm ${tier.highlight ? "text-white/50" : "text-white/60"}`}>{tier.tagline}</p>
                  </div>

                  {/* Setup fee */}
                  <div className={`p-4 rounded-xl mb-4 ${tier.highlight ? "bg-white/[0.07]" : "bg-white/[0.05]"} border ${tier.highlight ? "border-white/10" : "border-white/[0.08]"}`}>
                    <div className={`font-pixel text-[9px] tracking-widest mb-2 ${tier.highlight ? "text-white/30" : "text-white/40"}`}>ONE-TIME</div>
                    <div className={`text-3xl font-light ${tier.highlight ? "text-white" : "text-white"}`}>{tier.setup}</div>
                    <div className={`text-xs mt-1 ${tier.highlight ? "text-white/40" : "text-white/55"}`}>{tier.setupNote}</div>
                  </div>

                  {/* Annual */}
                  <div className={`p-4 rounded-xl mb-6 ${tier.highlight ? "bg-white/[0.07]" : "bg-white/[0.05]"} border ${tier.highlight ? "border-white/10" : "border-white/[0.08]"}`}>
                    <div className={`font-pixel text-[9px] tracking-widest mb-2 ${tier.highlight ? "text-white/30" : "text-white/40"}`}>ANNUAL SUBSCRIPTION</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-light ${tier.highlight ? "text-white" : "text-white"}`}>{tier.annual}</span>
                      <span className={`text-xs ${tier.highlight ? "text-white/40" : "text-white/55"}`}>/ year</span>
                    </div>
                    <div className={`text-xs mt-1 ${tier.highlight ? "text-white/40" : "text-white/55"}`}>{tier.monthly} / month equivalent</div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2.5 mb-8">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-start gap-2.5">
                        <span className={`text-sm shrink-0 mt-0.5 ${tier.highlight ? "text-[#00cbaa]" : "text-[#00cbaa]"}`}>+</span>
                        <span className={`text-xs leading-relaxed ${tier.highlight ? "text-white/60" : "text-white/70"}`}>{f}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map(f => (
                      <div key={f} className="flex items-start gap-2.5">
                        <span className={`text-sm shrink-0 mt-0.5 ${tier.highlight ? "text-white/20" : "text-white/35"}`}>-</span>
                        <span className={`text-xs leading-relaxed ${tier.highlight ? "text-white/25" : "text-white/40"}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={tier.ctaHref}
                    className={`block text-center py-3.5 rounded-full text-sm tracking-[0.012em] font-medium transition-colors ${
                      tier.highlight
                        ? "bg-[#eef35f] text-black hover:bg-[#f4f78a]"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise tier */}
      <section className="py-8 pb-24 px-6 md:px-12 lg:px-20 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          <BentoCard className="p-8 md:p-12" delay={0}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="mb-4"><PixelIcon type="pricing" size={36} /></div>
                <div className="font-pixel text-[10px] text-white/40 tracking-widest mb-3">ENTERPRISE - CUSTOM MODEL</div>
                <h2 className="text-3xl font-light mb-4">Custom deployment. Custom pricing.</h2>
                <p className="text-sm text-white/65 leading-relaxed mb-6">
                  For organisations with large-scale telemetry, specific compliance requirements, or infrastructure constraints that require a tailored deployment. Includes a dedicated support engineer, custom SLA, and a deployment model designed around your environment.
                </p>
                <div className="space-y-2">
                  {[
                    "More than 10 agents or custom agent architecture",
                    "Telemetry volume above 100 GB / month",
                    "Custom SLA and dedicated support engineer",
                    "Custom onboarding and staff training",
                    "Multi-region or air-gapped deployment options",
                    "White-label licensing available",
                    "Custom compliance rule development",
                  ].map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <span className="text-[#00cbaa] shrink-0 mt-0.5">+</span>
                      <span className="text-sm text-white/70">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
                  <div className="font-pixel text-[10px] text-white/40 tracking-widest mb-3">PRICING</div>
                  <div className="text-2xl font-light mb-2">Custom quote</div>
                  <p className="text-sm text-white/60 leading-relaxed">Pricing is based on agent count, telemetry volume, deployment complexity, and SLA requirements. Contact us for a scoping call.</p>
                </div>
                <Link href="/book-demo" className="block text-center py-4 bg-[#eef35f] text-black font-medium text-sm rounded-full hover:bg-[#f4f78a] transition-colors tracking-[0.012em]">
                  Contact Us for Enterprise
                </Link>
                <Link href="/contact" className="block text-center py-3.5 border border-white/15 text-white/72 text-sm rounded-full font-medium hover:border-white/30 hover:text-white transition-all tracking-[0.012em]">
                  Get in Touch
                </Link>
              </div>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* What is included in every plan */}
      <section className="py-24 px-6 md:px-12 lg:px-20 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          <Tag>EVERY PLAN INCLUDES</Tag>
          <h2 className="mt-5 text-3xl font-light tracking-tight mb-12">The full Veritas platform. No feature gating.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: "platform" as const, title: "Full PII Detection Engine", desc: "Detects personal data across dozens of entity types in every log line. Validated to eliminate false positives.", delay: 0 },
              { icon: "workflow" as const, title: "All 4 DPDPA Compliance Rules", desc: "Data Exposure, Purpose Violation, Retention Exceeded, Re-identification Risk - evaluated on every event.", delay: 60 },
              { icon: "pricing" as const, title: "Tamper-Evident Evidence Chain", desc: "SHA-256 hash chain on every verdict. Verifiable at any time. Export signed PDF reports for regulators.", delay: 120 },
              { icon: "integrations" as const, title: "Investigation Dashboard", desc: "All 7 views including Live Stream, Audit Ledger, Agents, Policy, and Case management.", delay: 0 },
              { icon: "agents" as const, title: "On-Premise Deployment", desc: "Your data never leaves your network. No cloud dependency, no call home. Zero egress.", delay: 60 },
              { icon: "platform" as const, title: "Machine-Bound Licensing", desc: "RSA-PSS signed license files. Verified locally on every startup. No internet connection required.", delay: 120 },
            ].map(item => (
              <BentoCard key={item.title} className="p-7" delay={item.delay}>
                <div className="mb-4"><PixelIcon type={item.icon} size={32} /></div>
                <h3 className="text-base font-light mb-2 leading-snug">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto">
          <Tag>PRICING FAQ</Tag>
          <h2 className="mt-5 text-3xl font-light tracking-tight mb-10">Common questions.</h2>
          <div className="space-y-3">
            {[
              {
                q: "What is the setup and licensing fee for?",
                a: "The one-time fee covers the initial deployment of the Veritas Server and Agent(s) on your infrastructure, machine-bound license generation, configuration of your org policy YAML, and a walkthrough session with your compliance and engineering teams.",
              },
              {
                q: "What happens if I need more agents mid-year?",
                a: "Additional agents can be added as an upgrade at any time. You pay a prorated amount for the remainder of your subscription year and move to the next tier. Contact us to upgrade.",
              },
              {
                q: "What counts as telemetry data?",
                a: "Telemetry refers to the raw log events and API traffic records ingested by your Veritas Agents and forwarded to the Veritas Server for analysis. One log line typically corresponds to one event.",
              },
              {
                q: "Is there a free trial?",
                a: "We offer a guided demo where we deploy Veritas in a sandboxed environment tailored to your use case. This gives you hands-on experience before committing. Book a demo to get started.",
              },
              {
                q: "Do I pay more if I generate more telemetry than my tier limit?",
                a: "If your monthly telemetry consistently exceeds your tier limit, we will work with you to move to the next tier. There are no surprise overage fees - we will notify you well in advance.",
              },
              {
                q: "Can I get a custom contract or invoice-based billing?",
                a: "Yes. All tiers can be arranged on a custom contract with invoice-based billing on request. This is standard for enterprise procurement processes.",
              },
            ].map((faq, i) => {
              const [open, setOpen] = useState(false)
              return (
                <div key={i} className="rounded-2xl border border-white/[0.09] bg-[#0e0f11] overflow-hidden">
                  <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-6 text-left hover:bg-[#141617] transition-colors">
                    <span className="text-sm font-light leading-snug pr-6">{faq.q}</span>
                    <span className="text-white/40 shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </span>
                  </button>
                  <div style={{ maxHeight: open ? "300px" : "0", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                    <p className="px-6 pb-6 text-sm text-white/65 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 lg:px-20 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">
          <Link href="/book-demo" className="flex-1 px-8 py-4 bg-[#eef35f] text-black font-medium text-sm rounded-full hover:bg-[#f4f78a] transition-colors tracking-[0.012em] text-center">BOOK A Demo</Link>
          <Link href="/contact" className="flex-1 px-8 py-4 border border-white/15 text-white/72 text-sm rounded-full font-medium hover:border-white/30 hover:text-white transition-all tracking-[0.012em] text-center">Contact Us</Link>
        </div>
      </section>

      <VeritasFooter />
    </div>
  )
}
