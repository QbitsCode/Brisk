/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' for Vercel deployment
  images: { 
    unoptimized: true,
    domains: ['brisk-eslint-no67x5utw-qblocks-projects.vercel.app'],
  },
  // Proper asset configuration for Vercel
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Completely disable ESLint for builds
  eslint: {
    // This completely disables ESLint during builds
    ignoreDuringBuilds: true,
    // Also disable ESLint on dev server
    ignoreDevelopmentErrors: true,
    // Don't even run the linter on build
    dirs: [],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to require canvas on the client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'canvas': false,
      }
    }
    
    // Disable ESLint webpack plugin
    config.plugins = config.plugins.filter(plugin => 
      plugin.constructor.name !== 'ESLintWebpackPlugin'
    );

    return config
  },
}

module.exports = nextConfig
