import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // Standalone is needed for Docker deployment (Linux server).
  // On Windows, symlink creation requires Developer Mode or admin rights,
  // so we disable it locally and enable only in CI/deploy via env var.
  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui.shadcn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'orca-app-7hejo.ondigitalocean.app',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      { protocol: 'https', 
        hostname: 'moday.sfo3.digitaloceanspaces.com' 
      },
    ],
    dangerouslyAllowSVG: true, // se exibir SVG
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack rules if needed
    return config;
  },
  
  // Headers for better security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
