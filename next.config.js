/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' for Vercel deployment
  images: { unoptimized: true },
  // Remove basePath and assetPrefix for Vercel
  // basePath: '/Brisk',
  // assetPrefix: '/Brisk/',
  // Ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to require canvas on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'canvas': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
