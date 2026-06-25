import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Shared workspace packages ship TS source and must be transpiled by Next.
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
}

export default nextConfig
