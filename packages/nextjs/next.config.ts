import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Em desenvolvimento, não usar basePath nem output: 'export'
  // Essas configurações são apenas para build de produção (GitHub Pages)
  ...(isProduction ? {
    // Configuração para GitHub Pages (apenas em produção)
    basePath: '/arcsight',
    output: 'export',
    images: {
      unoptimized: true,
    },
    // Removido trailingSlash para evitar problemas com GitHub Pages
    // O Next.js gera /market/10.html em vez de /market/10/index.html
    trailingSlash: false,
  } : {}),
};

export default nextConfig;
