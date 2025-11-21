import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para GitHub Pages
  // Repositório: arcsight (não é username.github.io)
  basePath: '/arcsight',
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
