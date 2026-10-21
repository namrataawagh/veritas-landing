import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/contact", "Contact", "Questions about Veritas, security reports and partnership enquiries.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
