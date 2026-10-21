import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/documentation/troubleshooting", "Troubleshooting", "Fixes for licence, service, agent, certificate and evidence verification issues in Veritas.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
