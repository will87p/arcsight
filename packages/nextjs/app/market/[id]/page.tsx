import MarketDetailClient from './MarketDetailClient';

// Função necessária para static export com rotas dinâmicas
export function generateStaticParams() {
  // Retorna IDs de 1 a 10 para gerar páginas estáticas
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function MarketDetail({ params }: { params: { id: string } }) {
  return <MarketDetailClient marketId={parseInt(params.id)} />;
}
