import type { MetadataRoute } from "next"

export const dynamic = "force-static"

const BASE = "https://agentveritas.in"
const ROUTES = [
  "", "/product", "/how-it-works", "/use-cases", "/security", "/pricing", "/about",
  "/documentation", "/documentation/quickstart", "/documentation/user-guide", "/documentation/troubleshooting",
  "/book-demo", "/contact", "/privacy", "/license",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(route => ({ url: `${BASE}${route}`, changeFrequency: "monthly", priority: route === "" ? 1 : 0.7 }))
}
