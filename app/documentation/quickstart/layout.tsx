import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/documentation/quickstart", "Quickstart", "From a fresh server to your first finding and a verified evidence pack, on your own infrastructure.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
