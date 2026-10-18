// Cloudflare Worker in front of the static site. Only /api/* reaches this code
// (see run_worker_first in wrangler.jsonc); everything else is served from ./out.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  RESEND_API_KEY: string
  EMAIL_FROM: string
  // Optional direct installer links; when unset the email points to the docs instead
  DOWNLOAD_URL_LINUX?: string
  DOWNLOAD_URL_MACOS?: string
  DOWNLOAD_URL_WINDOWS?: string
}

type Os = "linux" | "macos" | "windows"

const COOLDOWN_MINUTES = 10 // one email per OS per user in this window
const HOURLY_LIMIT = 5 // across all OSes

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === "/api/request-download") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405)
      try {
        return await requestDownload(request, env)
      } catch (err) {
        console.error("request-download failed", err)
        return json({ error: "Something went wrong. Please try again." }, 500)
      }
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404)
    return env.ASSETS.fetch(request)
  },
}

async function requestDownload(request: Request, env: Env): Promise<Response> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) return json({ error: "Please sign in first." }, 401)

  const body = (await request.json().catch(() => null)) as { os?: string } | null
  const os = body?.os as Os
  if (!os || !(os in GUIDES)) return json({ error: "Unknown operating system." }, 400)

  // Verify the Supabase session; this also gives us the Google account's email
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) return json({ error: "Your session has expired. Please sign in again." }, 401)
  const user = (await userRes.json()) as { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } }
  if (!user.email) return json({ error: "Your account has no email address." }, 400)
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null

  // All table access runs as the user, so row-level security applies
  const rest = (path: string, init: RequestInit = {}) =>
    fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...init.headers,
      },
    })

  // DPDPA: only process the email address while the user's consent is active
  const consentRes = await rest("consents?select=purposes&withdrawn_at=is.null&order=granted_at.desc&limit=1")
  if (!consentRes.ok) throw new Error(`consent lookup ${consentRes.status}: ${await consentRes.text()}`)
  const [consent] = (await consentRes.json()) as { purposes: string[] }[]
  if (!consent?.purposes.includes("installation_guide")) {
    return json({ error: "Please accept the consent notice before requesting a download." }, 403)
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recentRes = await rest(`download_requests?select=os,created_at&created_at=gte.${hourAgo}&order=created_at.desc`)
  if (!recentRes.ok) throw new Error(`recent lookup ${recentRes.status}: ${await recentRes.text()}`)
  const recent = (await recentRes.json()) as { os: Os; created_at: string }[]
  const cooldownStart = Date.now() - COOLDOWN_MINUTES * 60 * 1000
  if (recent.some(r => r.os === os && Date.parse(r.created_at) > cooldownStart)) {
    return json({ ok: true, email: user.email, duplicate: true })
  }
  if (recent.length >= HOURLY_LIMIT) return json({ error: "Too many requests. Please try again in an hour." }, 429)

  const guide = GUIDES[os]
  const downloadUrl = { linux: env.DOWNLOAD_URL_LINUX, macos: env.DOWNLOAD_URL_MACOS, windows: env.DOWNLOAD_URL_WINDOWS }[os]
  const site = new URL(request.url).origin

  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [user.email],
      subject: `Your Veritas installation guide for ${guide.label}`,
      html: emailHtml({ name, guide, downloadUrl, site }),
      text: emailText({ name, guide, downloadUrl, site }),
    }),
  })
  const sent = (await sendRes.json().catch(() => ({}))) as { id?: string; message?: string }
  if (!sendRes.ok) console.error("resend error", sendRes.status, sent)

  const insertRes = await rest("download_requests", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: user.id,
      email: user.email,
      full_name: name,
      os,
      email_status: sendRes.ok ? "sent" : "failed",
      email_id: sent.id ?? null,
    }),
  })
  if (!insertRes.ok) console.error("insert error", insertRes.status, await insertRes.text())

  if (!sendRes.ok) return json({ error: "We couldn't send the email. Please try again shortly." }, 502)
  return json({ ok: true, email: user.email })
}

// ─── Email content (mirrors /documentation install steps) ────────────────────

type Guide = { label: string; requirements: string; docsAnchor: string; steps: { title: string; code: string }[] }

const GUIDES: Record<Os, Guide> = {
  linux: {
    label: "Linux",
    requirements: "Ubuntu 22.04+ / Debian",
    docsAnchor: "linux",
    steps: [
      { title: "Install the .deb package", code: "sudo apt install ./veritas_1.0.16_amd64.deb" },
      { title: "Get your machine fingerprint and send it to your Veritas contact", code: "sudo veritas fingerprint" },
      { title: "Install the license you receive; the service starts via systemd", code: "sudo veritas license /path/to/veritas.vlic\nsudo systemctl status veritas" },
      { title: "Complete first-boot setup at http://your-server-ip:8000/setup", code: "sudo veritas setup-code" },
    ],
  },
  macos: {
    label: "macOS",
    requirements: "macOS 12+ (Apple Silicon)",
    docsAnchor: "macos",
    steps: [
      { title: "Open the installer package and follow the wizard", code: "open Veritas-1.0.16.pkg" },
      { title: "Get your machine fingerprint and send it to your Veritas contact", code: "veritas fingerprint" },
      { title: "Install the license you receive; the service starts via launchd", code: "veritas license /path/to/veritas.vlic" },
      { title: "Complete first-boot setup at http://localhost:8000/setup", code: "veritas setup-code" },
    ],
  },
  windows: {
    label: "Windows",
    requirements: "Windows 10/11 · Server 2019/2022",
    docsAnchor: "windows",
    steps: [
      { title: "Run the installer and follow the wizard", code: "VeritasSetup-1.0.16.exe" },
      { title: "Get your machine fingerprint and send it to your Veritas contact", code: "veritas fingerprint" },
      { title: "Install the license you receive; the service runs via Windows SCM", code: "veritas license C:\\path\\to\\veritas.vlic" },
      { title: "Complete first-boot setup at http://localhost:8000/setup", code: "veritas setup-code" },
    ],
  },
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

type EmailArgs = { name: string | null; guide: Guide; downloadUrl?: string; site: string }

function emailHtml({ name, guide, downloadUrl, site }: EmailArgs) {
  const docs = `${site}/documentation#${guide.docsAnchor}`
  const steps = guide.steps
    .map(
      (s, i) => `
      <tr><td style="padding:0 0 20px">
        <div style="font-size:14px;color:#ffffff;margin:0 0 8px"><span style="color:#eef35f;font-family:Menlo,Consolas,monospace">${i + 1}.</span> ${esc(s.title)}</div>
        <pre style="margin:0;padding:12px 14px;background:#141617;border:1px solid #303438;border-radius:8px;font:13px/1.6 Menlo,Consolas,monospace;color:#cfcfd3;white-space:pre-wrap">${esc(s.code)}</pre>
      </td></tr>`,
    )
    .join("")
  const button = (href: string, label: string) =>
    `<a href="${esc(href)}" style="display:inline-block;padding:12px 24px;border-radius:50px;background:#eef35f;color:#000000;font-weight:600;font-size:14px;text-decoration:none">${label}</a>`

  return `<!doctype html><html><body style="margin:0;background:#000000;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000"><tr><td align="center" style="padding:40px 16px">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0e0f11;border:1px solid #21232a;border-radius:12px">
      <tr><td style="padding:32px 32px 8px">
        <img src="${esc(site)}/veritas-wordmark.png" alt="Veritas" height="24" style="display:block;height:24px;width:auto">
      </td></tr>
      <tr><td style="padding:16px 32px 8px">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:500;color:#ffffff">Install Veritas on ${esc(guide.label)}</h1>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#a1a1aa">Hi${name ? ` ${esc(name.split(" ")[0])}` : ""}, thanks for requesting Veritas. Here's how to get it running on ${esc(guide.requirements)}.</p>
      </td></tr>
      <tr><td style="padding:16px 32px 8px">${downloadUrl ? button(downloadUrl, `Download for ${esc(guide.label)}`) : ""}</td></tr>
      <tr><td style="padding:16px 32px 0"><table width="100%" cellpadding="0" cellspacing="0">${steps}</table></td></tr>
      <tr><td style="padding:0 32px 32px">
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a1a1aa">The full guide, including the Kubernetes agent and troubleshooting, is in the documentation.</p>
        ${button(docs, "Open the installation guide")}
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#61626b">You received this because you requested a Veritas download at ${esc(site.replace(/^https?:\/\//, ""))}.</p>
  </td></tr></table></body></html>`
}

function emailText({ name, guide, downloadUrl, site }: EmailArgs) {
  return [
    `Hi${name ? ` ${name.split(" ")[0]}` : ""},`,
    "",
    `Thanks for requesting Veritas. Here's how to install it on ${guide.requirements}.`,
    ...(downloadUrl ? ["", `Download: ${downloadUrl}`] : []),
    "",
    ...guide.steps.flatMap((s, i) => [`${i + 1}. ${s.title}`, ...s.code.split("\n").map(l => `   ${l}`), ""]),
    `Full guide: ${site}/documentation#${guide.docsAnchor}`,
  ].join("\n")
}
