"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useContract, Market } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatEtherValue, formatTimeRemaining, formatDate, formatAddress } from "@/lib/utils";

interface MarketDetailClientProps {
  marketId?: number;
}

export default function MarketDetailClient({ marketId: propMarketId }: MarketDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useWallet();
  const { t, language } = useLanguage();
  const { fetchMarket, placeBet, resolveMarket, claimWinnings, getUserBets } = useContract();
  
  // Estado para armazenar o marketId extraído da URL
  const [extractedMarketId, setExtractedMarketId] = useState<number | null>(null);

  // Função para extrair o ID da URL (memoizada para evitar loops)
  const extractMarketIdFromUrl = useCallback(() => {
    if (propMarketId) {
      setExtractedMarketId(propMarketId);
      return;
    }
    
    let foundId: number | null = null;
    
    // Tenta extrair da URL de várias formas
    if (pathname) {
      // Formato: /market/123 ou /arcsight/market/123
      const match = pathname.match(/\/market\/(\d+)/);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          foundId = parsed;
        }
      }
      
      // Fallback: pegar o último segmento numérico da URL
      if (!foundId) {
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && /^\d+$/.test(lastSegment)) {
          const parsed = parseInt(lastSegment, 10);
          if (!isNaN(parsed) && parsed > 0) {
            foundId = parsed;
          }
        }
      }
    }
    
    // Fallback: tentar pegar da window.location (apenas uma vez)
    if (!foundId && typeof window !== 'undefined') {
      const urlMatch = window.location.pathname.match(/\/market\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        const parsed = parseInt(urlMatch[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          foundId = parsed;
        }
      }
    }
    
    // Só atualizar se o ID mudou (evita loops)
    setExtractedMarketId(prev => {
      if (prev === foundId) return prev;
      return foundId;
    });
  }, [propMarketId, pathname]);

  // Extrair o ID quando o componente montar ou quando pathname/propMarketId mudar
  useEffect(() => {
    extractMarketIdFromUrl();
  }, [extractMarketIdFromUrl]);

  // Usar propMarketId se disponível, senão usar o extraído
  const marketId = propMarketId || extractedMarketId;

  // Debug: log do marketId
  useEffect(() => {
    console.log('[MarketDetailClient] marketId:', marketId);
    console.log('[MarketDetailClient] pathname:', pathname);
    console.log('[MarketDetailClient] propMarketId:', propMarketId);
    console.log('[MarketDetailClient] extractedMarketId:', extractedMarketId);
  }, [marketId, pathname, propMarketId, extractedMarketId]);

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
  const isLoadingMarketRef = useRef(false); // Ref para evitar múltiplas chamadas simultâneas

  // Memoizar loadMarket para evitar recriações desnecessárias
  const loadMarket = useCallback(async () => {
    if (!marketId) {
      setError("ID do mercado não encontrado");
      setIsLoading(false);
      return;
    }
    
    // Evitar múltiplas chamadas simultâneas usando ref
    if (isLoadingMarketRef.current) {
      console.log('[MarketDetailClient] loadMarket já em execução, ignorando...');
      return;
    }
    
    isLoadingMarketRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[MarketDetailClient] Carregando mercado:', marketId);
      const marketData = await fetchMarket(marketId);
      
      if (!marketData || marketData.id === BigInt(0)) {
        setError("Mercado não encontrado");
        setMarket(null);
      } else {
        setMarket(marketData);
        if (isConnected && address && marketId) {
          try {
            const bets = await getUserBets(marketId);
            setUserBets(bets);
          } catch (betError) {
            console.warn('[MarketDetailClient] Erro ao carregar apostas do usuário:', betError);
            // Não bloquear se falhar ao carregar apostas
          }
        }
      }
    } catch (err: any) {
      console.error('[MarketDetailClient] Erro ao carregar mercado:', err);
      setError(err.message || "Erro ao carregar mercado");
    } finally {
      setIsLoading(false);
      isLoadingMarketRef.current = false;
    }
  }, [marketId, address, isConnected, fetchMarket, getUserBets]);

  useEffect(() => {
    if (marketId) {
      loadMarket();
    } else {
      setIsLoading(false);
    }
  }, [marketId, loadMarket]);

  async function handleBet(outcome: boolean) {
    if (!marketId) {
      setError(t.detail.invalidId);
      return;
    }

    if (!isConnected) {
      setError(language === 'pt-BR' ? "Por favor, conecte sua carteira primeiro" : "Please connect your wallet first");
      return;
    }

    // Validar e normalizar o valor (substituir vírgula por ponto)
    const normalizedAmount = betAmount.replace(',', '.').trim();
    const amountValue = parseFloat(normalizedAmount);
    
    if (!betAmount || isNaN(amountValue) || amountValue <= 0) {
      setError(language === 'pt-BR' ? "Por favor, insira um valor válido maior que zero" : "Please enter a valid value greater than zero");
      return;
    }

    if (amountValue < 0.001) {
      setError(language === 'pt-BR' ? "O valor mínimo da aposta é 0.001 USDC" : "Minimum bet amount is 0.001 USDC");
      return;
    }

    if (!market || market.resolved) {
      setError(language === 'pt-BR' ? "Este mercado já foi resolvido" : "This market is already resolved");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(market.resolutionTime) <= now) {
      setError(t.detail.waitingResolution);
      return;
    }

    setIsPlacingBet(true);
    setError(null);
    setSuccess(null);

    try {
      // Usar o valor normalizado
      await placeBet(marketId, outcome, normalizedAmount);
      setSuccess(`${language === 'pt-BR' ? "Aposta de" : "Bet of"} ${normalizedAmount} USDC ${language === 'pt-BR' ? "em" : "on"} ${outcome ? t.marketCard.yes : t.marketCard.no} ${language === 'pt-BR' ? "realizada com sucesso!" : "placed successfully!"}`);
      setBetAmount("");
      await loadMarket();
    } catch (err: any) {
      console.error("[handleBet] Erro completo ao fazer aposta:", err);
      console.error("[handleBet] Tipo do erro:", typeof err);
      console.error("[handleBet] Código do erro:", err.code);
      console.error("[handleBet] Mensagem do erro:", err.message);
      console.error("[handleBet] Stack do erro:", err.stack);
      
      // Mensagens de erro mais específicas
      let errorMessage = language === 'pt-BR' ? "Erro ao fazer aposta" : "Error placing bet";
      
      const errMsg = err.message?.toLowerCase() || '';
      const errCode = err.code?.toString() || '';
      
      if (errMsg.includes("insufficient funds") || 
          errMsg.includes("saldo") || 
          errMsg.includes("balance") ||
          errMsg.includes("insufficient balance")) {
        errorMessage = language === 'pt-BR' 
          ? "Saldo insuficiente. Verifique se você tem USDC suficiente na carteira."
          : "Insufficient balance. Please check if you have enough USDC in your wallet.";
      } else if (errMsg.includes("rejected") || 
                 errMsg.includes("user rejected") || 
                 errMsg.includes("denied") ||
                 errCode === "4001") {
        errorMessage = language === 'pt-BR' ? "Transação cancelada pelo usuário" : "Transaction cancelled by user";
      } else if (errMsg.includes("revert") || errMsg.includes("reverted")) {
        errorMessage = language === 'pt-BR'
          ? "Transação revertida. Verifique se o mercado ainda está aberto e se você tem saldo suficiente."
          : "Transaction reverted. Please check if the market is still open and if you have sufficient balance.";
      } else if (errMsg.includes("invalid value") || 
                 errMsg.includes("invalid amount") || 
                 errMsg.includes("valor inválido") ||
                 errMsg.includes("erro ao converter valor")) {
        errorMessage = language === 'pt-BR' 
          ? "Valor inválido. Use apenas números (ex: 0.1 ou 1.5)"
          : "Invalid value. Use only numbers (e.g., 0.1 or 1.5)";
      } else if (errMsg.includes("network") || errMsg.includes("chain")) {
        errorMessage = language === 'pt-BR'
          ? "Erro de rede. Verifique se está conectado à rede Arc Testnet."
          : "Network error. Please check if you are connected to Arc Testnet.";
      } else if (errMsg.includes("carteira não conectada") || errMsg.includes("wallet not connected")) {
        errorMessage = language === 'pt-BR'
          ? "Carteira não conectada. Por favor, conecte sua carteira primeiro."
          : "Wallet not connected. Please connect your wallet first.";
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = language === 'pt-BR'
          ? `Erro desconhecido: ${JSON.stringify(err)}`
          : `Unknown error: ${JSON.stringify(err)}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsPlacingBet(false);
    }
  }

  async function handleResolve() {
    if (!marketId) {
      setError("ID do mercado inválido");
      return;
    }

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
    if (!marketId) {
      setError("ID do mercado inválido");
      return;
    }

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

  // Só mostrar erro se não estiver carregando e não tiver marketId
  if (!marketId && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-400 mb-4">ID do mercado inválido ou não encontrado.</p>
          <p className="text-gray-400 text-sm mb-4">
            URL: {typeof window !== 'undefined' ? window.location.pathname : pathname}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voltar para a lista
          </button>
        </main>
      </div>
    );
  }
  
  // Se não tem marketId mas está carregando, mostrar loading
  if (!marketId) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400 text-lg">Carregando mercado...</p>
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
                  type="text"
                  inputMode="decimal"
                  value={betAmount}
                  onChange={(e) => {
                    // Permitir apenas números, ponto e vírgula
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    // Substituir vírgula por ponto para validação
                    const normalized = value.replace(',', '.');
                    // Verificar se é um número válido
                    if (value === '' || (!isNaN(parseFloat(normalized)) && parseFloat(normalized) >= 0)) {
                      setBetAmount(value);
                    }
                  }}
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
                  type="text"
                  inputMode="decimal"
                  value={betAmount}
                  onChange={(e) => {
                    // Permitir apenas números, ponto e vírgula
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    // Substituir vírgula por ponto para validação
                    const normalized = value.replace(',', '.');
                    // Verificar se é um número válido
                    if (value === '' || (!isNaN(parseFloat(normalized)) && parseFloat(normalized) >= 0)) {
                      setBetAmount(value);
                    }
                  }}
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

