import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
    }
    return config;
  }
};

export default nextConfig;
