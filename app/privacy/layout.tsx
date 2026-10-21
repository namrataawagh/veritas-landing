import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/privacy", "Privacy policy", "How the Veritas website handles account, download and contact data, and why the Veritas software sends nothing to us.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
