import MarketDetailClient from './MarketDetailClient';

// Função necessária apenas para static export (produção)
export function generateStaticParams() {
  return Array.from({ length: 1000 }, (_, i) => ({
    id: String(i + 1),
  }));
}

interface MarketDetailProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function MarketDetail({ params }: MarketDetailProps) {
  // No Next.js 16, params pode ser uma Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Extrair e validar o ID
  let marketId: number | undefined = undefined;
  
  try {
    if (resolvedParams && resolvedParams.id) {
      const parsed = parseInt(resolvedParams.id, 10);
      if (!isNaN(parsed) && parsed > 0) {
        marketId = parsed;
      }
    }
  } catch (error) {
    // Se houver erro ao parsear, deixa o MarketDetailClient ler da URL
    console.log('Erro ao parsear ID do params, usando fallback da URL');
  }
  
  // Passa o ID como prop, mas o componente também pode ler da URL
  return <MarketDetailClient marketId={marketId} />;
}
