import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/about", "About", "Why we built Veritas, the principles behind it, and the team behind it, Demo Gods.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
