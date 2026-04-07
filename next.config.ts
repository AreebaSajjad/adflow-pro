/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {           
    typedRoutes: false,     
  },
  images: {
    domains: ['img.youtube.com', 'res.cloudinary.com', 'raw.githubusercontent.com'],
  },
}
module.exports = nextConfig