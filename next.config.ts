/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['img.youtube.com', 'res.cloudinary.com', 'raw.githubusercontent.com'],
  },
}
module.exports = nextConfig