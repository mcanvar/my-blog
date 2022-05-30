/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.pexels.com',
      'secure.gravatar.com',
      'fonts.googleapis.com',
    ],
  },
}

module.exports = nextConfig
