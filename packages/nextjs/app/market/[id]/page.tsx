import MarketDetailClient from './MarketDetailClient';

// Função necessária para static export com rotas dinâmicas
export function generateStaticParams() {
  // Gera páginas para IDs de 1 a 1000
  // Isso cobre a maioria dos casos. Se houver mais mercados,
  // será necessário aumentar este número
  return Array.from({ length: 1000 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function MarketDetail({ params }: { params: { id: string } }) {
  // Passa o ID como prop, mas o componente também pode ler da URL
  return <MarketDetailClient marketId={parseInt(params.id)} />;
}
