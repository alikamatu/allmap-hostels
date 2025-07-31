/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // Force Webpack usage
  },
};

module.exports = nextConfig;
