import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/product", "Product", "How Veritas masks personal data at the source, turns findings into owned incidents, applies plain-language rules with two-person approval, and keeps evidence an auditor can verify on their own.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
