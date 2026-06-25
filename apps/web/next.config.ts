import type { NextConfig } from 'next'

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://screener-api.ariunzul.workers.dev'

const nextConfig: NextConfig = {
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
