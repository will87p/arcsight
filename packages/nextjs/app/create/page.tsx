"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useContract } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";

export default function CreateMarket() {
  const router = useRouter();
  const { isConnected, address, connect } = useWallet();
  const { createMarket } = useContract();
  const [description, setDescription] = useState("");
  const [resolutionTime, setResolutionTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isConnected || !address) {
      setError("Por favor, conecte sua carteira primeiro");
      return;
    }

    if (!description.trim()) {
      setError("A descrição é obrigatória");
      return;
    }

    if (!resolutionTime) {
      setError("A data de resolução é obrigatória");
      return;
    }

    const timestamp = Math.floor(new Date(resolutionTime).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (timestamp <= now) {
      setError("A data de resolução deve ser no futuro");
      return;
    }

    setIsSubmitting(true);
    setTxHash(null);
    setError(null);
    setSuccess(false);

    // Timeout de segurança para não travar a UI
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setError("A operação está demorando muito. Verifique se a transação foi enviada no MetaMask.");
      }
    }, 30000); // 30 segundos máximo

    try {
      const hash = await createMarket(description, timestamp);
      clearTimeout(timeoutId);
      
      setTxHash(hash);
      setSuccess(true);
      
      // Se retornou um hash, a transação foi enviada
      console.log("Transação enviada com sucesso! Hash:", hash);
      
      // Mostrar mensagem de sucesso e redirecionar após um tempo
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // Se o erro menciona timeout mas temos um hash, a transação foi enviada
      if (err.message?.includes("timeout") || err.message?.includes("Timed out")) {
        // Tentar extrair o hash do erro se disponível
        const hashMatch = err.message?.match(/0x[a-fA-F0-9]{64}/);
        if (hashMatch) {
          setTxHash(hashMatch[0]);
        }
        setError(
          "A transação foi enviada, mas está aguardando confirmação. " +
          "Recarregue a página em alguns instantes para verificar se foi criada."
        );
      } else if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setError("Transação cancelada pelo usuário");
      } else {
        setError(err.message || "Erro ao criar mercado");
      }
      console.error("Erro ao criar mercado:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Obter data mínima (agora + 1 hora)
  const minDateTime = new Date(Date.now() + 3600000)
    .toISOString()
    .slice(0, 16);

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg text-center">
            <p className="text-gray-400 mb-4">Você precisa conectar sua carteira para criar um mercado.</p>
            <button
              onClick={connect}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Conectar Carteira
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Criar Novo Mercado
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
            <p className="mb-2">{error}</p>
            {txHash && (
              <div className="mt-3 pt-3 border-t border-red-700">
                <p className="text-sm mb-2">Transação enviada:</p>
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                >
                  {txHash}
                </a>
                <p className="text-xs mt-2 text-red-300">
                  Clique no link acima para verificar o status da transação no explorador.
                </p>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
            <p className="mb-2">Mercado criado com sucesso! Redirecionando...</p>
            {txHash && (
              <div className="mt-3 pt-3 border-t border-green-700">
                <p className="text-sm mb-2">Ver transação:</p>
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Descrição do Mercado
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Ex: O Bitcoin atingirá $100.000 até o final de 2024?"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="resolutionTime"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Data e Hora de Resolução
            </label>
            <input
              type="datetime-local"
              id="resolutionTime"
              value={resolutionTime}
              onChange={(e) => setResolutionTime(e.target.value)}
              required
              min={minDateTime}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-400">
              A data deve ser no futuro. O mercado será resolvido nesta data.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Criando..." : "Criar Mercado"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

