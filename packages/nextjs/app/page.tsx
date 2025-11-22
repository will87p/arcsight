"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useContract } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { formatEtherValue, formatTimeRemaining } from "@/lib/utils";

export default function Home() {
  const { markets, isLoading, error, fetchMarkets, deleteMarket } = useContract();
  const { address, isConnected } = useWallet();
  const [deletingMarketId, setDeletingMarketId] = useState<number | null>(null);

  // Carregar mercados quando a página carrega
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  async function handleDeleteMarket(marketId: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Tem certeza que deseja deletar este mercado? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingMarketId(marketId);
    try {
      await deleteMarket(marketId);
      alert("Mercado deletado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao deletar mercado");
    } finally {
      setDeletingMarketId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-8">Mercados Abertos</h1>
          <div className="flex gap-4 justify-center items-center">
            <Link
              href="/create"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg"
            >
              Criar Novo Mercado
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
            <button
              onClick={fetchMarkets}
              className="mt-2 text-sm underline hover:text-red-300"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Carregando mercados...</p>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Nenhum mercado encontrado.</p>
            <Link
              href="/create"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Criar o primeiro mercado
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => {
              const totalPot = market.totalYesAmount + market.totalNoAmount;
              const isResolved = market.resolved;
              const timeRemaining = isResolved
                ? "Resolvido"
                : formatTimeRemaining(market.resolutionTime);
              
              // Verificar se pode deletar: é o criador, não está resolvido e não tem apostas
              const canDelete = isConnected && 
                address?.toLowerCase() === market.creator.toLowerCase() &&
                !isResolved && 
                totalPot === BigInt(0);
              const isDeleting = deletingMarketId === Number(market.id);

              return (
                <div key={market.id.toString()} className="relative">
                  <Link
                    href={`/market/${market.id}`}
                    className="block"
                  >
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition hover:border-blue-500 cursor-pointer h-full flex flex-col">
                      <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2 flex-grow">
                        {market.description}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Pote Total:</span>
                          <span className="text-lg font-bold text-blue-400">
                            {formatEtherValue(totalPot)} USDC
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Status:</span>
                          <span
                            className={`text-sm font-medium ${
                              isResolved
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {isResolved ? "Resolvido" : timeRemaining}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {canDelete && (
                    <button
                      onClick={(e) => handleDeleteMarket(Number(market.id), e)}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      title="Deletar mercado (apenas se não houver apostas)"
                    >
                      {isDeleting ? "Deletando..." : "🗑️"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
