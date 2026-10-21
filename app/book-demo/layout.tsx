import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/book-demo", "Book a demo", "A live walkthrough of Veritas: personal data masked at the source, incidents with owners, and evidence verified without our servers.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
