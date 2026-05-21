/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export' genera HTML/CSS/JS puros que Express puede servir como estáticos
  // igual que VoltBodyPowered (Vite build -> dist -> express.static)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
