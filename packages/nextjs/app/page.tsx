"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import MarketCard from "@/components/MarketCard";
import { useContract } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatEtherValue } from "@/lib/utils";
import { saveMarketImage } from "@/lib/imageStorage";

export default function Home() {
  const { markets, isLoading, error, fetchMarkets, deleteMarket } = useContract();
  const { address, isConnected } = useWallet();
  const { t, language } = useLanguage();
  const [deletingMarketId, setDeletingMarketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Função para detectar categoria do mercado baseado na descrição
  const getMarketCategory = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('política') || desc.includes('eleição') || desc.includes('presidente') || 
        desc.includes('governo') || desc.includes('político') || desc.includes('votação')) {
      return 'politics';
    }
    if (desc.includes('esporte') || desc.includes('futebol') || desc.includes('basquete') || 
        desc.includes('fórmula') || desc.includes('olímpico') || desc.includes('campeonato')) {
      return 'sports';
    }
    if (desc.includes('cultura') || desc.includes('filme') || desc.includes('música') || 
        desc.includes('arte') || desc.includes('oscar') || desc.includes('festival')) {
      return 'culture';
    }
    if (desc.includes('bitcoin') || desc.includes('cripto') || desc.includes('crypto') || 
        desc.includes('ethereum') || desc.includes('blockchain') || desc.includes('nft')) {
      return 'crypto';
    }
    if (desc.includes('clima') || desc.includes('temperatura') || desc.includes('chuva') || 
        desc.includes('aquecimento') || desc.includes('ambiental')) {
      return 'climate';
    }
    if (desc.includes('economia') || desc.includes('inflação') || desc.includes('juros') || 
        desc.includes('pib') || desc.includes('recessão')) {
      return 'economy';
    }
    if (desc.includes('empresa') || desc.includes('corporação') || desc.includes('negócio') || 
        desc.includes('startup')) {
      return 'companies';
    }
    if (desc.includes('finança') || desc.includes('investimento') || desc.includes('ação') || 
        desc.includes('bolsa') || desc.includes('mercado financeiro')) {
      return 'finance';
    }
    if (desc.includes('tecnologia') || desc.includes('ciência') || desc.includes('ia') || 
        desc.includes('inteligência artificial') || desc.includes('robô') || desc.includes('software')) {
      return 'tech';
    }
    if (desc.includes('saúde') || desc.includes('médico') || desc.includes('hospital') || 
        desc.includes('doença') || desc.includes('vacina')) {
      return 'health';
    }
    if (desc.includes('mundo') || desc.includes('internacional') || desc.includes('global') || 
        desc.includes('guerra') || desc.includes('país')) {
      return 'world';
    }
    
    return 'all';
  };

  // Carregar mercados quando a página carrega
  useEffect(() => {
    fetchMarkets();
    
    // Verificar configuração de imagens
    const checkImageConfig = () => {
      const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      const jsonbinId = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID;
      
      if (!imgbbKey) {
        console.warn('⚠️ NEXT_PUBLIC_IMGBB_API_KEY não configurado. Imagens não serão enviadas para servidor público.');
        console.warn('📖 Veja CONFIGURAR_IMAGENS_PASSO_A_PASSO.md para instruções.');
      }
      
      if (!jsonbinId) {
        console.warn('⚠️ NEXT_PUBLIC_JSONBIN_BIN_ID não configurado. Imagens não serão compartilhadas entre usuários.');
        console.warn('📖 Veja CONFIGURAR_IMAGENS_PASSO_A_PASSO.md para instruções.');
        console.warn('🔗 JSONBin: https://jsonbin.io/');
      } else {
        console.log('✅ JSONBin configurado. Imagens serão compartilhadas entre usuários.');
      }
    };
    
    checkImageConfig();
    
    // Migrar imagens antigas (base64) para ImgBB e sincronizar
    const syncAndMigrateImages = async () => {
      try {
        // 1. Primeiro, sincronizar imagens do JSONBin (prioridade)
        console.log('[page.tsx] 🔄 Iniciando sincronização de imagens...');
        const { fetchSharedImages, getMarketImages } = await import("@/lib/imageStorage");
        const sharedImages = await fetchSharedImages();
        
        if (sharedImages.length > 0) {
          console.log(`[page.tsx] 📥 ${sharedImages.length} imagens encontradas no JSONBin`);
          
          const localImages = getMarketImages();
          const mergedImages = [...localImages];
          let addedCount = 0;
          let updatedCount = 0;
          
          sharedImages.forEach(sharedImage => {
            // Apenas processar imagens com URLs válidas (http)
            if (!sharedImage.imageUrl || !sharedImage.imageUrl.startsWith('http')) {
              return;
            }
            
            const existingIndex = mergedImages.findIndex(img => img.marketId === sharedImage.marketId);
            if (existingIndex >= 0) {
              const existing = mergedImages[existingIndex];
              // Sempre atualizar se a imagem compartilhada for uma URL (mesmo que já exista)
              // Isso garante que imagens de outros usuários sejam atualizadas
              mergedImages[existingIndex] = sharedImage;
              updatedCount++;
              console.log(`[page.tsx] Atualizando imagem do mercado ${sharedImage.marketId}:`, sharedImage.imageUrl.substring(0, 50) + '...');
            } else {
              // Adicionar nova imagem compartilhada (de outros usuários)
              mergedImages.push(sharedImage);
              addedCount++;
              console.log(`[page.tsx] Adicionando nova imagem do mercado ${sharedImage.marketId}:`, sharedImage.imageUrl.substring(0, 50) + '...');
            }
          });
          
          localStorage.setItem('arcsight_market_images', JSON.stringify(mergedImages));
          console.log(`[page.tsx] ✅ Sincronização: ${addedCount} novas, ${updatedCount} atualizadas, ${mergedImages.length} total`);
        }
        
        // 2. Depois, migrar imagens antigas (base64) para ImgBB
        const { migrateOldImages, clearSharedImagesCache } = await import("@/lib/imageStorage");
        await migrateOldImages();
        
        // 3. Limpar cache para forçar recarregamento
        clearSharedImagesCache();
        
        // 4. Disparar evento customizado para que MarketCards recarreguem
        window.dispatchEvent(new CustomEvent('imagesSynced'));
        console.log('[page.tsx] ✅ Sincronização completa - MarketCards serão atualizados');
      } catch (error) {
        console.warn('[page.tsx] ⚠️ Erro ao sincronizar imagens (continuando):', error);
      }
    };
    
    syncAndMigrateImages();
  }, [fetchMarkets]);

  // Associar imagem pendente ao mercado recém-criado
  useEffect(() => {
    if (markets.length > 0) {
      const pendingImage = sessionStorage.getItem('pending_market_image');
      const pendingDescription = sessionStorage.getItem('pending_market_description');
      
      if (pendingImage && pendingDescription) {
        // Encontrar o mercado mais recente com a descrição correspondente
        const matchingMarket = markets.find(
          m => m.description.toLowerCase().trim() === pendingDescription.toLowerCase().trim()
        );
        
        if (matchingMarket) {
          // Fazer upload da imagem e salvar a URL
          saveMarketImage(Number(matchingMarket.id), pendingImage)
            .then(() => {
              console.log(`[page.tsx] Imagem do mercado ${matchingMarket.id} salva com sucesso`);
              // Limpar sessionStorage
              sessionStorage.removeItem('pending_market_image');
              sessionStorage.removeItem('pending_market_description');
              // Recarregar para mostrar a imagem
              fetchMarkets();
            })
            .catch((error) => {
              console.error(`[page.tsx] Erro ao salvar imagem do mercado ${matchingMarket.id}:`, error);
              // Limpar sessionStorage mesmo em caso de erro
              sessionStorage.removeItem('pending_market_image');
              sessionStorage.removeItem('pending_market_description');
            });
        }
      }
    }
  }, [markets, fetchMarkets]);

  // Filtrar e buscar mercados
  const filteredMarkets = useMemo(() => {
    let filtered = markets;

    // Aplicar filtro de categoria
    if (activeFilter === "trending") {
      // Mercados com maior volume (top 10)
      filtered = [...filtered]
        .sort((a, b) => {
          const totalA = Number(a.totalYesAmount + a.totalNoAmount);
          const totalB = Number(b.totalYesAmount + b.totalNoAmount);
          return totalB - totalA;
        })
        .slice(0, 10);
    } else if (activeFilter === "new") {
      // Mercados mais recentes (não resolvidos, ordenados por ID decrescente)
      filtered = filtered
        .filter((market) => !market.resolved)
        .sort((a, b) => Number(b.id) - Number(a.id));
    } else if (activeFilter !== "all") {
      // Filtrar por categoria
      filtered = filtered.filter((market) => 
        getMarketCategory(market.description) === activeFilter
      );
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((market) =>
        market.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [markets, activeFilter, searchQuery]);

  async function handleDeleteMarket(marketId: number) {
    if (!confirm("Tem certeza que deseja deletar este mercado? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingMarketId(marketId);
    try {
      const hash = await deleteMarket(marketId);
      console.log("Mercado deletado, hash da transação:", hash);
      setTimeout(() => {
        fetchMarkets();
      }, 2000);
    } catch (err: any) {
      console.error("Erro ao deletar mercado:", err);
      alert(err.message || "Erro ao deletar mercado");
    } finally {
      setDeletingMarketId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
      <Header onSearch={setSearchQuery} />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {t.home.title}
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            {t.home.subtitle}
          </p>
          <Link
            href="/create"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all font-semibold text-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95"
          >
            {t.home.createNewMarket}
          </Link>
        </div>

        {/* Seção Faucet - Obter USDC Testnet */}
        {!isConnected && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t.home.needTestnetUSDC}</h3>
                  <p className="text-gray-400 text-sm">{t.home.faucetDescription}</p>
                </div>
              </div>
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition font-semibold shadow-lg hover:shadow-green-500/50 whitespace-nowrap flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t.home.getUSDC}
              </a>
            </div>
          </div>
        )}

        {/* Estatísticas rápidas */}
        {!isLoading && markets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">{t.home.totalMarkets}</div>
              <div className="text-2xl font-bold text-white">{markets.length}</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">{t.home.openMarkets}</div>
              <div className="text-2xl font-bold text-green-400">
                {markets.filter((m) => !m.resolved).length}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">{t.home.totalVolume}</div>
              <div className="text-2xl font-bold text-blue-400">
                ${markets.reduce((sum, m) => {
                  const total = m.totalYesAmount + m.totalNoAmount;
                  return sum + parseFloat(formatEtherValue(total));
                }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
              </div>
            </div>
          </div>
        )}

        {/* Mensagens de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400">
            <p className="font-semibold mb-1">{t.common.error}</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchMarkets}
              className="mt-3 text-sm underline hover:text-red-300 transition"
            >
              {t.common.tryAgain}
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 text-lg">{t.home.loading}</p>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery || activeFilter !== "all"
                ? t.home.noMarketsFiltered
                : t.home.noMarkets}
            </p>
            {!searchQuery && activeFilter === "all" && (
              <Link
                href="/create"
                className="text-blue-400 hover:text-blue-300 underline transition"
              >
                {t.home.createFirstMarket}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Resultados da busca/filtro */}
            {(searchQuery || activeFilter !== "all") && (
              <div className="mb-6 text-sm text-gray-400">
                {t.home.showing} {filteredMarkets.length} {t.home.of} {markets.length} {t.home.markets}{markets.length !== 1 ? (language === 'pt-BR' ? 's' : 's') : ''}
              </div>
            )}

            {/* Grid de mercados - estilo Kalshi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id.toString()}
                  market={market}
                  onDelete={handleDeleteMarket}
                  deletingMarketId={deletingMarketId}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
