/** @type {import('next').NextConfig} */
const nextConfig = {
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
