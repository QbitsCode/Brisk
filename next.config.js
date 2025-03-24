/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' for Vercel deployment
  images: { unoptimized: true },
  // Remove basePath and assetPrefix for Vercel
  // basePath: '/Brisk',
  // assetPrefix: '/Brisk/',
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
