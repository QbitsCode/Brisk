/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set output to 'standalone' for better Vercel compatibility
  output: 'standalone',
  // Configure images to be completely unoptimized for maximum compatibility
  images: { 
    unoptimized: true,
    domains: ['*'],
  },
  // Disable assetPrefix for Vercel deployments
  assetPrefix: undefined,
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Completely disable ESLint for builds
  eslint: {
    ignoreDuringBuilds: true,
    ignoreDevelopmentErrors: true,
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
