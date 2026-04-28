/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // En produccion (contenedor unico), nginx hace el proxy de /api/* al backend
  // En dev local, Next.js reescribe /api/* al backend en localhost:3001
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return []; // nginx se encarga en produccion
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
