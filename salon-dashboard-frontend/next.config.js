/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3000/:path*', // Redirige automáticamente las llamadas de /api al backend
      },
    ]
  },
}

module.exports = nextConfig