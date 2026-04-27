/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3000/api/:path*', // Preserva el prefijo /api para que coincida con el backend
      },

    ]
  },
}

module.exports = nextConfig