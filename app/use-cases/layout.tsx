import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/use-cases", "Use cases", "How fintech, health and e-commerce teams use Veritas to keep Aadhaar, PAN and contact details out of logs and APIs, and to answer auditors and customers with evidence.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
