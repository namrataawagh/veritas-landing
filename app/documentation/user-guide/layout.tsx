import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/documentation/user-guide", "User guide", "Findings and incidents, rules and approvals, the evidence chain and its witnesses, audit packs, rights requests and roles.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
