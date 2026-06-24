import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@pinequest/types'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
