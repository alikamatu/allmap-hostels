/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // Force Webpack usage
  },
    "compilerOptions": {
    "types": ["maplibre-gl"]
  }
};

module.exports = nextConfig;
