import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/documentation", "Documentation", "Install the Veritas server and agents on Linux, macOS or Windows, declare your data policy, and manage the service from the command line.")

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
