"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useContract } from "@/lib/useContract";
import { formatEtherValue, formatTimeRemaining } from "@/lib/utils";

export default function Home() {
  const { markets, isLoading, error, fetchMarkets } = useContract();

  // Carregar mercados quando a página carrega
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

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
            <button
              onClick={() => {
                console.log("[Home] Botão de atualizar clicado");
                fetchMarkets();
              }}
              className="px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
              title="Atualizar lista de mercados"
            >
              🔄 Atualizar
            </button>
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

              return (
                <Link
                  key={market.id.toString()}
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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
