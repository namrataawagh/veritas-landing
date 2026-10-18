"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Session } from "@supabase/supabase-js"
import { ChevronDown, Loader2, LogOut, ShieldCheck, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

// ─── Consent notice (DPDPA s.5/s.6) ───────────────────────────────────────────
// Bump NOTICE_VERSION whenever the notice text changes; stored with each consent.
export const NOTICE_VERSION = "2026-10-18"
const PURPOSES = ["installation_guide"]
const GRIEVANCE_EMAIL = "privacy@agentveritas.in"

export type Os = "linux" | "macos" | "windows"
export type DownloadStatus =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; email: string }
  | { state: "error"; message: string }

type Dialog =
  | { kind: "register" } // notice shown before Google sign-in
  | { kind: "post-login" } // signed in via "Log in" but no consent on record yet
  | { kind: "delete" } // withdraw consent + erase data
  | null

type Pending = { consent?: { version: string; purposes: string[] }; os?: Os }

type AuthCtx = {
  session: Session | null
  ready: boolean
  hasConsent: boolean
  login: () => void
  register: () => void
  signOut: () => void
  openDelete: () => void
  requestDownload: (os: Os) => void
  downloads: Partial<Record<Os, DownloadStatus>>
}

const Ctx = createContext<AuthCtx | null>(null)
export const useAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error("useAuth must be used inside <AuthProvider>")
  return c
}

// Survives the Google redirect: consent given before sign-in, and the download that started it
const PENDING_KEY = "veritas:pending-auth"
const pending = {
  get: (): Pending | null => { try { return JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null") } catch { return null } },
  set: (p: Pending) => { try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(p)) } catch {} },
  clear: () => { try { sessionStorage.removeItem(PENDING_KEY) } catch {} },
}

async function fetchConsent(): Promise<boolean> {
  const { data, error } = await supabase
    .from("consents")
    .select("purposes")
    .is("withdrawn_at", null)
    .order("granted_at", { ascending: false })
    .limit(1)
  if (error) throw error
  return !!data?.[0]?.purposes?.includes("installation_guide")
}

async function recordConsent(c: { version: string; purposes: string[] }) {
  const { error } = await supabase.from("consents").insert({ notice_version: c.version, purposes: c.purposes })
  if (error) throw error
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [deferredOs, setDeferredOs] = useState<Os | null>(null)
  const [downloads, setDownloads] = useState<Partial<Record<Os, DownloadStatus>>>({})
  const handledUser = useRef<string | null>(null)

  const setDl = (os: Os, s: DownloadStatus) => setDownloads(prev => ({ ...prev, [os]: s }))

  const sendDownload = useCallback(async (os: Os, s: Session) => {
    setDl(os, { state: "sending" })
    try {
      const res = await fetch("/api/request-download", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${s.access_token}` },
        body: JSON.stringify({ os }),
      })
      const data = (await res.json().catch(() => ({}))) as { email?: string; error?: string }
      setDl(os, res.ok ? { state: "sent", email: data.email ?? s.user.email ?? "" } : { state: "error", message: data.error ?? "Something went wrong." })
    } catch {
      setDl(os, { state: "error", message: "Network error. Please try again." })
    }
  }, [])

  const startGoogle = async (p: Pending) => {
    pending.set(p)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
    })
    if (error) {
      pending.clear()
      if (p.os) setDl(p.os, { state: "error", message: "Couldn't start Google sign-in. Please try again." })
    }
  }

  // After every sign-in: store consent given before the redirect, check consent, resume the download
  useEffect(() => {
    const onSession = async (s: Session | null) => {
      setSession(s)
      if (!s) { setHasConsent(false); handledUser.current = null; setReady(true); return }
      if (handledUser.current === s.user.id) return
      handledUser.current = s.user.id

      const p = pending.get()
      pending.clear()
      if (p) window.history.replaceState(null, "", window.location.pathname + (p.os ? "#download" : ""))
      try {
        if (p?.consent) await recordConsent(p.consent)
        const ok = await fetchConsent()
        setHasConsent(ok)
        if (!ok) {
          if (p?.os) setDeferredOs(p.os)
          setDialog({ kind: "post-login" })
        } else if (p?.os) {
          document.getElementById("download")?.scrollIntoView({ behavior: "smooth" })
          sendDownload(p.os, s)
        }
      } catch (err) {
        console.error("consent check failed", err)
        if (p?.os) setDl(p.os, { state: "error", message: "Couldn't verify your consent. Please try again." })
      }
      setReady(true)
    }
    supabase.auth.getSession().then(({ data }) => onSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { onSession(s) })
    return () => sub.subscription.unsubscribe()
  }, [sendDownload])

  const value: AuthCtx = {
    session,
    ready,
    hasConsent,
    downloads,
    login: () => startGoogle({}),
    register: () => setDialog({ kind: "register" }),
    signOut: () => { supabase.auth.signOut() },
    openDelete: () => setDialog({ kind: "delete" }),
    requestDownload: (os: Os) => {
      if (!session) { setDeferredOs(os); setDialog({ kind: "register" }); return }
      if (!hasConsent) { setDeferredOs(os); setDialog({ kind: "post-login" }); return }
      sendDownload(os, session)
    },
  }

  const closeDialog = () => { setDialog(null); setDeferredOs(null) }

  return (
    <Ctx.Provider value={value}>
      {children}
      {dialog?.kind === "register" && (
        <ConsentDialog
          mode="register"
          onCancel={closeDialog}
          onAgree={async () => {
            await startGoogle({ consent: { version: NOTICE_VERSION, purposes: PURPOSES }, os: deferredOs ?? undefined })
          }}
        />
      )}
      {dialog?.kind === "post-login" && session && (
        <ConsentDialog
          mode="post-login"
          onCancel={async () => {
            // Declining: nothing was consented to, so erase the account Google sign-in just created
            await supabase.rpc("delete_my_account")
            await supabase.auth.signOut()
            closeDialog()
          }}
          onAgree={async () => {
            await recordConsent({ version: NOTICE_VERSION, purposes: PURPOSES })
            setHasConsent(true)
            const os = deferredOs
            closeDialog()
            if (os) sendDownload(os, session)
          }}
        />
      )}
      {dialog?.kind === "delete" && session && (
        <DeleteDialog
          email={session.user.email ?? ""}
          onCancel={closeDialog}
          onConfirm={async () => {
            const { error } = await supabase.rpc("delete_my_account")
            if (error) throw error
            await supabase.auth.signOut()
            setDownloads({})
            closeDialog()
          }}
        />
      )}
    </Ctx.Provider>
  )
}

// ─── Dialog shell ─────────────────────────────────────────────────────────────

function Modal({ labelledBy, onClose, children }: { labelledBy: string; onClose?: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const first = ref.current?.querySelector<HTMLElement>("input") ?? ref.current?.querySelector<HTMLElement>("button")
    first?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && onClose) onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
  }, [onClose])
  return (
    <div className="tg-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
      <div ref={ref} className="tg-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  )
}

function ConsentDialog({ mode, onAgree, onCancel }: { mode: "register" | "post-login"; onAgree: () => Promise<void>; onCancel: () => Promise<void> | void }) {
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState<"agree" | "cancel" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (which: "agree" | "cancel", fn: () => Promise<void> | void) => {
    setBusy(which); setError(null)
    try { await fn() } catch { setError("Something went wrong. Please try again."); setBusy(null) }
  }

  return (
    <Modal labelledBy="consent-title" onClose={mode === "register" ? () => { onCancel() } : undefined}>
      <div className="tg-modal-head">
        <span className="tg-modal-icon"><ShieldCheck /></span>
        <div>
          <h2 id="consent-title" className="tg-modal-title">Consent notice</h2>
          <p className="tg-modal-sub">Under India&apos;s Digital Personal Data Protection Act, 2023</p>
        </div>
        {mode === "register" && (
          <button type="button" className="tg-modal-x" onClick={() => onCancel()} aria-label="Close"><X /></button>
        )}
      </div>

      <div className="tg-modal-body">
        <p>
          Veritas (<b>agentveritas.in</b>) is the Data Fiduciary for the personal data below. Please read this notice
          before you {mode === "register" ? "continue with Google" : "continue"}.
        </p>
        <dl className="tg-notice">
          <div><dt>What we collect</dt><dd>Your name and Gmail address from your Google account, and the operating system and time of each download request.</dd></div>
          <div><dt>Why we need it</dt><dd>To email the installation guide for the OS you choose to your Gmail, and to keep a record of your requests so we can support your installation and licensing. We don&apos;t use it for marketing and never sell it.</dd></div>
          <div><dt>Who handles it</dt><dd>Google (sign-in), Supabase (account and request records), Resend (email delivery) and Cloudflare (hosting), acting on our instructions.</dd></div>
          <div><dt>How long we keep it</dt><dd>Until you withdraw consent or delete your account, after which it&apos;s erased.</dd></div>
          <div><dt>Your rights</dt><dd>You can access, correct or erase your data, nominate someone to act for you, and withdraw consent at any time from the account menu (&ldquo;Withdraw consent &amp; delete data&rdquo;)  -  as easily as you gave it.</dd></div>
          <div><dt>Grievances</dt><dd>Write to <a href={`mailto:${GRIEVANCE_EMAIL}`}>{GRIEVANCE_EMAIL}</a>. If we don&apos;t resolve it, you can complain to the Data Protection Board of India.</dd></div>
        </dl>
        <p className="tg-modal-fine">Full details in our <Link href="/privacy">privacy policy</Link>. Notice version {NOTICE_VERSION}.</p>

        <label className="tg-check">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
          <span>I have read this notice and consent to Veritas processing my name and Gmail address for the purposes above.</span>
        </label>
        {error && <p className="tg-dl-note err" role="alert">{error}</p>}
      </div>

      <div className="tg-modal-actions">
        <button type="button" className="tg-btn tg-btn-text" disabled={!!busy} onClick={() => run("cancel", onCancel)}>
          {busy === "cancel" ? <Loader2 className="tg-spin-icon" /> : null}
          {mode === "register" ? "Cancel" : "Decline and sign out"}
        </button>
        <button type="button" className="tg-btn tg-btn-primary" disabled={!checked || !!busy} onClick={() => run("agree", onAgree)}>
          {busy === "agree" ? <Loader2 className="tg-spin-icon" /> : mode === "register" ? <GoogleG /> : null}
          {mode === "register" ? "Agree & continue with Google" : "Agree & continue"}
        </button>
      </div>
    </Modal>
  )
}

function DeleteDialog({ email, onConfirm, onCancel }: { email: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <Modal labelledBy="delete-title" onClose={busy ? undefined : onCancel}>
      <div className="tg-modal-head">
        <span className="tg-modal-icon danger"><Trash2 /></span>
        <div>
          <h2 id="delete-title" className="tg-modal-title">Withdraw consent &amp; delete data</h2>
          <p className="tg-modal-sub">{email}</p>
        </div>
      </div>
      <div className="tg-modal-body">
        <p>This permanently erases your Veritas account, your consent record and your download history, and signs you out. Emails already delivered stay in your inbox.</p>
        <p>You can register again at any time.</p>
        {error && <p className="tg-dl-note err" role="alert">{error}</p>}
      </div>
      <div className="tg-modal-actions">
        <button type="button" className="tg-btn tg-btn-text" disabled={busy} onClick={onCancel}>Keep my account</button>
        <button
          type="button"
          className="tg-btn tg-btn-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true); setError(null)
            try { await onConfirm() } catch { setError("Couldn't delete your data. Please try again."); setBusy(false) }
          }}
        >
          {busy && <Loader2 className="tg-spin-icon" />} Withdraw &amp; delete
        </button>
      </div>
    </Modal>
  )
}

// ─── Header controls ──────────────────────────────────────────────────────────

export function AuthControls({ variant, onAction }: { variant: "header" | "menu"; onAction?: () => void }) {
  const { session, ready, login, register, signOut, openDelete } = useAuth()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", esc)
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc) }
  }, [open])

  const act = (fn: () => void) => () => { setOpen(false); onAction?.(); fn() }

  if (!ready) return <span className={variant === "header" ? "tg-auth-placeholder" : undefined} aria-hidden="true" />

  if (!session) {
    return (
      <div className={variant === "header" ? "tg-auth" : "tg-menu-auth"}>
        <button type="button" className="tg-btn tg-btn-brand-outline" onClick={act(login)}>Log in</button>
        <button type="button" className="tg-btn tg-btn-brand" onClick={act(register)}>Register</button>
      </div>
    )
  }

  const email = session.user.email ?? ""
  const name = (session.user.user_metadata?.full_name as string | undefined) ?? email
  const initial = name.trim().charAt(0).toUpperCase() || "?"

  if (variant === "menu") {
    return (
      <div className="tg-menu-account">
        <span className="tg-menu-email">Signed in as {email}</span>
        <button type="button" onClick={act(signOut)}><LogOut size={16} /> Sign out</button>
        <button type="button" className="danger" onClick={act(openDelete)}><Trash2 size={16} /> Withdraw consent &amp; delete data</button>
      </div>
    )
  }

  return (
    <div className="tg-account" ref={wrap}>
      <button type="button" className="tg-account-btn" onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}>
        <span className="tg-avatar" aria-hidden="true">{initial}</span>
        <ChevronDown size={14} />
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div className="tg-account-menu" role="menu">
          <div className="tg-account-who">
            <b>{name}</b>
            <span>{email}</span>
          </div>
          <button type="button" role="menuitem" onClick={act(signOut)}><LogOut size={15} /> Sign out</button>
          <button type="button" role="menuitem" className="danger" onClick={act(openDelete)}><Trash2 size={15} /> Withdraw consent &amp; delete data</button>
        </div>
      )}
    </div>
  )
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}
