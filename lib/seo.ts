import type { Metadata } from "next"

// Per-page metadata. A route's openGraph and twitter replace the root layout's, so the shared image goes in every page.
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const full = `${title} | Veritas`
  return {
    // absolute, so nested routes keep the suffix even under a layout that sets its own title
    title: { absolute: full },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url: path,
      siteName: "Veritas",
      locale: "en_IN",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Veritas, the DPDPA evidence layer for engineering teams" }],
    },
    twitter: { card: "summary_large_image", title: full, description, images: ["/og-image.png"] },
  }
}
