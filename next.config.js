/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
    ],
    // Remove unoptimized for production - Next.js will optimize images
    // unoptimized: true, // Only for local development if needed
  },
  experimental: {
    serverActions: true,
  },
  output: 'standalone',
}

module.exports = nextConfig

