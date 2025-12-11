import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Specific Google Auth domain
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Wildcard for other Google variations
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // Wildcard for other Google variations
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // (Optional) Useful if you add GitHub Auth later
      }
    ],
  },
};

export default nextConfig;
