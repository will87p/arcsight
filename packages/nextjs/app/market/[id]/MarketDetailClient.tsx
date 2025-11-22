"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useContract, Market } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { formatEtherValue, formatTimeRemaining, formatDate, formatAddress } from "@/lib/utils";

interface MarketDetailClientProps {
  marketId?: number;
}

export default function MarketDetailClient({ marketId: propMarketId }: MarketDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useWallet();
  const { fetchMarket, placeBet, resolveMarket, claimWinnings, getUserBets } = useContract();
  
  // Lê o ID da URL se não foi passado como prop (para static export)
  const getMarketIdFromUrl = () => {
    if (propMarketId) return propMarketId;
    // Extrai o ID da URL: /arcsight/market/123 -> 123
    const match = pathname?.match(/\/market\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };
  
  const marketId = getMarketIdFromUrl();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [userBets, setUserBets] = useState<{ yesBet: bigint; noBet: bigint }>({ yesBet: BigInt(0), noBet: BigInt(0) });
  const [betAmount, setBetAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [winningOutcome, setWinningOutcome] = useState<boolean | null>(null);

  useEffect(() => {
    if (marketId) {
      loadMarket();
    }
  }, [marketId, address]);

  async function loadMarket() {
    if (!marketId) {
      setError("ID do mercado não encontrado");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const marketData = await fetchMarket(marketId);
      if (!marketData || marketData.id === BigInt(0)) {
        setError("Mercado não encontrado");
        setMarket(null);
      } else {
        setMarket(marketData);
        if (isConnected && address) {
          const bets = await getUserBets(marketId);
          setUserBets(bets);
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar mercado");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBet(outcome: boolean) {
    if (!isConnected) {
      setError("Por favor, conecte sua carteira primeiro");
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError("Por favor, insira um valor válido");
      return;
    }

    if (!market || market.resolved) {
      setError("Este mercado já foi resolvido");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(market.resolutionTime) <= now) {
      setError("O tempo de resolução já passou");
      return;
    }

    setIsPlacingBet(true);
    setError(null);
    setSuccess(null);

    try {
      await placeBet(marketId, outcome, betAmount);
      setSuccess(`Aposta de ${betAmount} USDC em ${outcome ? "SIM" : "NÃO"} realizada com sucesso!`);
      setBetAmount("");
      await loadMarket();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer aposta");
    } finally {
      setIsPlacingBet(false);
    }
  }

  async function handleResolve() {
    if (!isConnected || !market) {
      setError("Por favor, conecte sua carteira primeiro");
      return;
    }

    if (winningOutcome === null) {
      setError("Por favor, selecione o resultado vencedor");
      return;
    }

    if (address?.toLowerCase() !== market.oracle.toLowerCase()) {
      setError("Apenas o oráculo pode resolver este mercado");
      return;
    }

    setIsResolving(true);
    setError(null);
    setSuccess(null);

    try {
      await resolveMarket(marketId, winningOutcome);
      setSuccess("Mercado resolvido com sucesso!");
      setWinningOutcome(null);
      await loadMarket();
    } catch (err: any) {
      setError(err.message || "Erro ao resolver mercado");
    } finally {
      setIsResolving(false);
    }
  }

  async function handleClaim() {
    if (!isConnected) {
      setError("Por favor, conecte sua carteira primeiro");
      return;
    }

    setIsClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      await claimWinnings(marketId);
      setSuccess("Ganhos resgatados com sucesso!");
      await loadMarket();
    } catch (err: any) {
      setError(err.message || "Erro ao resgatar ganhos");
    } finally {
      setIsClaiming(false);
    }
  }

  if (!marketId) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-400 mb-4">ID do mercado inválido.</p>
          <button
            onClick={() => router.push("/")}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Voltar para a lista
          </button>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400 text-lg">Carregando mercado...</p>
        </main>
      </div>
    );
  }

  if (!market || market.id === BigInt(0)) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-400 mb-4">Mercado não encontrado.</p>
          <button
            onClick={() => router.push("/")}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Voltar para a lista
          </button>
        </main>
      </div>
    );
  }

  const totalPot = market.totalYesAmount + market.totalNoAmount;
  const isResolved = market.resolved;
  const canBet = !isResolved && Math.floor(Date.now() / 1000) < Number(market.resolutionTime);
  const isOracle = address?.toLowerCase() === market.oracle.toLowerCase();
  const canResolve = isOracle && !isResolved && Math.floor(Date.now() / 1000) >= Number(market.resolutionTime);
  const hasWinningBet = isResolved && 
    ((market.winningOutcome && userBets.yesBet > BigInt(0)) || (!market.winningOutcome && userBets.noBet > BigInt(0)));
  const canClaim = isResolved && hasWinningBet;

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-blue-400 hover:text-blue-300 underline"
        >
          ← Voltar para a lista
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">
            {market.description}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Pote Total</div>
              <div className="text-2xl font-bold text-white">
                {formatEtherValue(totalPot)} USDC
              </div>
            </div>
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">SIM</div>
              <div className="text-2xl font-bold text-green-400">
                {formatEtherValue(market.totalYesAmount)} USDC
              </div>
            </div>
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">NÃO</div>
              <div className="text-2xl font-bold text-red-400">
                {formatEtherValue(market.totalNoAmount)} USDC
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-400 mb-4">
            <div>
              <strong className="text-gray-300">Status:</strong>{" "}
              <span className={isResolved ? "text-green-400" : "text-yellow-400"}>
                {isResolved ? "Resolvido" : "Aberto"}
              </span>
            </div>
            {isResolved ? (
              <div>
                <strong className="text-gray-300">Resultado:</strong>{" "}
                <span className={market.winningOutcome ? "text-green-400" : "text-red-400"}>
                  {market.winningOutcome ? "SIM" : "NÃO"}
                </span>
              </div>
            ) : (
              <div>
                <strong className="text-gray-300">Tempo Restante:</strong>{" "}
                {formatTimeRemaining(market.resolutionTime)}
              </div>
            )}
            <div>
              <strong className="text-gray-300">Data de Resolução:</strong>{" "}
              {formatDate(market.resolutionTime)}
            </div>
            <div>
              <strong className="text-gray-300">Criador:</strong>{" "}
              {formatAddress(market.creator)}
            </div>
            {isConnected && (userBets.yesBet > BigInt(0) || userBets.noBet > BigInt(0)) && (
              <div className="pt-2 border-t border-gray-700">
                <strong className="text-gray-300">Suas Apostas:</strong>
                {userBets.yesBet > BigInt(0) && (
                  <div className="text-green-400">SIM: {formatEtherValue(userBets.yesBet)} USDC</div>
                )}
                {userBets.noBet > BigInt(0) && (
                  <div className="text-red-400">NÃO: {formatEtherValue(userBets.noBet)} USDC</div>
                )}
              </div>
            )}
          </div>

          {canClaim && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-400 mb-2">
                Você tem ganhos disponíveis para resgate!
              </p>
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {isClaiming ? "Resgatando..." : "Resgatar Ganhos"}
              </button>
            </div>
          )}

          {canResolve && (
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-400 mb-4">
                Você é o oráculo deste mercado. Selecione o resultado vencedor:
              </p>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setWinningOutcome(true)}
                  className={`px-6 py-2 rounded-lg transition font-medium ${
                    winningOutcome === true
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  SIM
                </button>
                <button
                  onClick={() => setWinningOutcome(false)}
                  className={`px-6 py-2 rounded-lg transition font-medium ${
                    winningOutcome === false
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  NÃO
                </button>
              </div>
              <button
                onClick={handleResolve}
                disabled={isResolving || winningOutcome === null}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResolving ? "Resolvendo..." : "Resolver Mercado"}
              </button>
            </div>
          )}
        </div>

        {canBet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">
                Apostar em SIM
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor (USDC)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="0.1"
                  disabled={isPlacingBet}
                />
              </div>
              <button
                onClick={() => handleBet(true)}
                disabled={!betAmount || isPlacingBet}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBet ? "Apostando..." : "Apostar SIM"}
              </button>
            </div>

            <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-red-400 mb-4">
                Apostar em NÃO
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor (USDC)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="0.1"
                  disabled={isPlacingBet}
                />
              </div>
              <button
                onClick={() => handleBet(false)}
                disabled={!betAmount || isPlacingBet}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBet ? "Apostando..." : "Apostar NÃO"}
              </button>
            </div>
          </div>
        )}

        {!canBet && !isResolved && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              O tempo de resolução já passou. Aguardando resolução do mercado pelo oráculo.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

