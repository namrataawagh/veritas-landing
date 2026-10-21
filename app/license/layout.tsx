import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/license", "License", "How Veritas is licensed: signed, machine-bound licence files that are verified offline on your own servers.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
