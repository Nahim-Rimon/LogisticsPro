import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // ← add this
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;