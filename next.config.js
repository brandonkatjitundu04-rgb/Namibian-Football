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
  // Server Actions are available by default in Next.js 14, no need for experimental flag
  output: 'standalone',
}

module.exports = nextConfig

