/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {                    // 👈 ये 2 lines add करो
    ignoreDuringBuilds: true,  // 👈
  },
  images: {
    domains: ['img.youtube.com', 'res.cloudinary.com', 'raw.githubusercontent.com'],
  },
}
module.exports = nextConfig