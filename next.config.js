/** @type {import('next').NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_DISABLE_ESLINT: '1',
    NEXT_TELEMETRY_DISABLED: '1'
  },
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
