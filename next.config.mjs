/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization for pages that don't use
  // getServerSideProps or getInitialProps
  reactStrictMode: true,
  swcMinify: true,
  // Configure webpack to handle Prisma correctly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for Prisma client in serverless environments
      config.externals = [...config.externals, 'prisma']
    }
    return config
  },
}

export default nextConfig
