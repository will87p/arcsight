import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para GitHub Pages
  // Se o repositório for 'username.github.io', deixe basePath comentado
  // Se o repositório tiver outro nome, descomente e ajuste:
  // basePath: '/nome-do-repositorio',
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
