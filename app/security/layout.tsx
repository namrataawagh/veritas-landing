import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/security", "Security", "How Veritas protects the data it watches: masking at the source, no raw values in the evidence store, encrypted evidence at rest, server-enforced roles, signed releases and clearly stated limits.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
