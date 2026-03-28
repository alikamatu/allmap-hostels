import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/ui", "@repo/types"],
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
