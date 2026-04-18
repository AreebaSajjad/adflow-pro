/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'img.youtube.com',
      'res.cloudinary.com', 
      'raw.githubusercontent.com',
      'images.unsplash.com',
    ],
  },
}

module.exports = nextConfig