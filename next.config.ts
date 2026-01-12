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
        hostname: 'utfs.io', // UploadThing
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub Auth
      }
    ],
  },
  // Production security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  // Request size limits
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Compression
  compress: true,
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: true, // Enable ETags for caching
};

export default nextConfig;
