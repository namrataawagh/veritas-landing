import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/pricing", "Pricing", "Veritas plans are priced per monitored server and billed annually, starting with a paid pilot on your own logs.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
