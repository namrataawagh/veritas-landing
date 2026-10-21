import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/how-it-works", "How it works", "Follow one log line through Veritas: masked on the host, checked against your declared policy, written into a hash chain, signed into checkpoints held by independent witnesses, and verified offline.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
