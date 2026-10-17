/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — exported to ./out and served as Cloudflare Workers static assets
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
