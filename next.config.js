/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Remove basePath and assetPrefix for Netlify
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
