import MarketDetailClient from './MarketDetailClient';

// Função necessária para static export com rotas dinâmicas
export function generateStaticParams() {
  // Retorna IDs de 1 a 100 para gerar páginas estáticas
  // Isso cobre a maioria dos mercados. Se houver mais de 100 mercados,
  // será necessário aumentar este número ou fazer um rebuild
  return Array.from({ length: 100 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function MarketDetail({ params }: { params: { id: string } }) {
  return <MarketDetailClient marketId={parseInt(params.id)} />;
}
