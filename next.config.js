/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'],
    unoptimized: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Explicitly specify the App Router configuration
  output: 'standalone',
  experimental: {
    serverActions: true,
    appDir: true
  },
  // Explicitly set the source directory for the app
  distDir: '.next',
  // Ensure Vercel recognizes the app directory properly
  reactStrictMode: true
};

module.exports = nextConfig;