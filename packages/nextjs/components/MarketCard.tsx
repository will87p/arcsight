"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEtherValue, formatTimeRemaining, getMarketUrl } from "@/lib/utils";
import { Market } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getMarketImage } from "@/lib/imageStorage";

interface MarketCardProps {
  market: Market;
  onDelete?: (marketId: number) => void;
  deletingMarketId?: number | null;
}

export default function MarketCard({ market, onDelete, deletingMarketId }: MarketCardProps) {
  const { isConnected, address } = useWallet();
  const { t } = useLanguage();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const totalPot = market.totalYesAmount + market.totalNoAmount;
  const isResolved = market.resolved;
  const timeRemaining = isResolved ? t.marketCard.resolved : formatTimeRemaining(market.resolutionTime);

  // Carregar imagem do mercado
  useEffect(() => {
    const marketId = Number(market.id);
    
    const loadImage = async () => {
      try {
        console.log(`[MarketCard ${marketId}] Carregando imagem...`);
        const image = await getMarketImage(marketId);
        if (image && image.startsWith('http')) {
          console.log(`[MarketCard ${marketId}] ✅ Imagem encontrada:`, image.substring(0, 50) + '...');
          setImageUrl(image);
        } else {
          console.log(`[MarketCard ${marketId}] ❌ Nenhuma imagem encontrada`);
          setImageUrl(null);
        }
      } catch (error) {
        console.error(`[MarketCard ${marketId}] Erro ao carregar imagem:`, error);
        setImageUrl(null);
      }
    };
    
    // Carregar imediatamente
    loadImage();
    
    // Ouvir evento de sincronização para recarregar
    const handleImagesSynced = () => {
      console.log(`[MarketCard ${marketId}] 🔄 Evento de sincronização recebido, recarregando...`);
      // Aguardar um pouco para garantir que localStorage foi atualizado
      setTimeout(loadImage, 100);
    };
    
    window.addEventListener('imagesSynced', handleImagesSynced);
    
    // Recarregar a cada 15 segundos (menos frequente para evitar rate limit)
    const interval = setInterval(loadImage, 15000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('imagesSynced', handleImagesSynced);
    };
  }, [market.id]);

  // Calcular probabilidades
  const totalPotNumber = Number(totalPot);
  const yesAmountNumber = Number(market.totalYesAmount);
  const noAmountNumber = Number(market.totalNoAmount);
  
  const yesProbability = totalPotNumber > 0 
    ? (yesAmountNumber / totalPotNumber) * 100 
    : 50;
  const noProbability = totalPotNumber > 0 
    ? (noAmountNumber / totalPotNumber) * 100 
    : 50;

  // Verificar se pode deletar
  const canDelete = isConnected && 
    address?.toLowerCase() === market.creator.toLowerCase() &&
    !isResolved && 
    totalPot === BigInt(0);
  const isDeleting = deletingMarketId === Number(market.id);

  const handleQuickBet = async (e: React.MouseEvent, outcome: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected) {
      alert(t.marketCard.connectToBet);
      return;
    }

    // Usar a função helper para gerar URL correta
    window.location.href = getMarketUrl(market.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && canDelete) {
      onDelete(Number(market.id));
    }
  };

  // Ícone padrão baseado na primeira palavra da descrição
  const getDefaultIcon = () => {
    const firstWord = market.description.toLowerCase().split(' ')[0];
    if (firstWord.includes('bitcoin') || firstWord.includes('cripto') || firstWord.includes('crypto')) return '₿';
    if (firstWord.includes('eleição') || firstWord.includes('política') || firstWord.includes('presidente')) return '🗳️';
    if (firstWord.includes('esporte') || firstWord.includes('futebol') || firstWord.includes('basquete')) return '⚽';
    if (firstWord.includes('clima') || firstWord.includes('temperatura')) return '🌡️';
    if (firstWord.includes('economia') || firstWord.includes('financeiro')) return '💰';
    return '📊';
  };

  return (
    <div className="relative group">
      <Link href={getMarketUrl(market.id)} className="block">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-500/50 cursor-pointer h-full flex flex-col">
          {/* Imagem do mercado - estilo Kalshi */}
          <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden">
            {imageUrl && imageUrl.startsWith('http') ? (
              <img
                src={imageUrl}
                alt={market.description}
                className="w-full h-full object-cover"
                onError={() => {
                  console.error(`[MarketCard] Erro ao carregar imagem:`, imageUrl);
                  setImageUrl(null);
                }}
                onLoad={() => {
                  console.log(`[MarketCard] ✅ Imagem carregada com sucesso:`, imageUrl.substring(0, 50) + '...');
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <span className="text-6xl opacity-50">{getDefaultIcon()}</span>
              </div>
            )}
            
            {/* Badge de status no canto superior direito */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  isResolved
                    ? "bg-green-500/80 text-white"
                    : "bg-yellow-500/80 text-white"
                }`}
              >
                {isResolved ? `✓ ${t.marketCard.resolved}` : "⏱ " + timeRemaining}
              </span>
            </div>

            {/* Botão deletar (se aplicável) */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-3 left-3 p-2 bg-red-600/80 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                title="Deletar mercado"
              >
                {isDeleting ? "⏳" : "🗑️"}
              </button>
            )}
          </div>

          {/* Conteúdo do card */}
          <div className="p-5 flex flex-col flex-grow">
            {/* Título do mercado - elemento mais proeminente */}
            <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 leading-tight min-h-[3rem]">
              {market.description}
            </h3>

            {/* Probabilidades - estilo Kalshi */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-400">{t.marketCard.yes}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                      style={{ width: `${yesProbability}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-400 min-w-[3rem] text-right">{yesProbability.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-gray-400">{t.marketCard.no}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-400 h-full transition-all duration-500"
                      style={{ width: `${noProbability}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-red-400 min-w-[3rem] text-right">{noProbability.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Volume Total - estilo Kalshi */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{t.marketCard.volume}</span>
                <span className="text-lg font-bold text-blue-400">
                  ${parseFloat(formatEtherValue(totalPot)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                </span>
              </div>
            </div>

            {/* Botões de ação rápida - estilo Kalshi */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={(e) => handleQuickBet(e, true)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                {t.marketCard.betYes}
              </button>
              <button
                onClick={(e) => handleQuickBet(e, false)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg hover:shadow-red-500/50 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                {t.marketCard.betNo}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
