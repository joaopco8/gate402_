import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@gate402/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'opencv.org' },
    ],
  },
};

export default nextConfig;
