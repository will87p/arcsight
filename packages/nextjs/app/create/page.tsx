"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useContract } from "@/lib/useContract";
import { useWallet } from "@/lib/useWallet";
import { imageFileToBase64, validateImageFile, saveMarketImage } from "@/lib/imageStorage";

export default function CreateMarket() {
  const router = useRouter();
  const { isConnected, address, connect } = useWallet();
  const { createMarket } = useContract();
  const [description, setDescription] = useState("");
  const [resolutionTime, setResolutionTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Erro ao validar imagem");
      return;
    }

    setImageFile(file);
    setError(null);

    try {
      const base64 = await imageFileToBase64(file);
      setImagePreview(base64);
      
      // Fazer upload imediatamente para ImgBB (se configurado)
      // Isso garante que a URL esteja disponível quando o mercado for criado
      try {
        const { uploadImageToImgBB } = await import("@/lib/imageStorage");
        const uploadedUrl = await uploadImageToImgBB(base64);
        if (uploadedUrl) {
          // Salvar URL do ImgBB no sessionStorage para usar depois
          sessionStorage.setItem('pending_image_url', uploadedUrl);
          console.log('[handleImageChange] Imagem enviada para ImgBB:', uploadedUrl);
        }
      } catch (uploadError) {
        console.warn('[handleImageChange] Erro ao fazer upload (continuando com base64 local):', uploadError);
        // Continuar com base64 local se upload falhar
      }
    } catch (err) {
      setError("Erro ao processar imagem");
      console.error(err);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    sessionStorage.removeItem('pending_image_url'); // Limpar URL do ImgBB também
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        console.warn("[handleSubmit] Timeout após 30 segundos");
        setIsSubmitting(false);
        setError("A operação está demorando muito. Verifique se a transação foi enviada no MetaMask. Se você aprovou a transação, ela pode estar sendo processada. Recarregue a página em alguns instantes.");
      }
    }, 60000); // Aumentar para 60 segundos

    try {
      // Salvar imagem temporariamente no sessionStorage antes de criar o mercado
      // Priorizar URL do ImgBB se disponível (já foi feito upload quando imagem foi selecionada)
      if (imagePreview) {
        const uploadedUrl = sessionStorage.getItem('pending_image_url');
        const imageToSave = uploadedUrl || imagePreview; // Usar URL do ImgBB se disponível
        
        sessionStorage.setItem('pending_market_image', imageToSave);
        sessionStorage.setItem('pending_market_description', description);
        
        console.log("[handleSubmit] Imagem preparada:", uploadedUrl ? "URL do ImgBB" : "Base64 local");
        
        // Limpar URL temporária (será usada agora)
        if (uploadedUrl) {
          sessionStorage.removeItem('pending_image_url');
        }
      }

      console.log("[handleSubmit] Iniciando criação de mercado...");
      console.log("[handleSubmit] Descrição:", description);
      console.log("[handleSubmit] Timestamp:", timestamp);
      
      const hash = await createMarket(description, timestamp);
      clearTimeout(timeoutId);
      
      console.log("[handleSubmit] Hash recebido:", hash);
      
      if (!hash || hash === '0x') {
        throw new Error("Hash da transação inválido. Tente novamente.");
      }
      
      setTxHash(hash);
      setSuccess(true);
      setIsSubmitting(false); // Garantir que o estado seja atualizado
      
      console.log("Transação enviada com sucesso! Hash:", hash);
      
      // Aguardar um pouco para a transação ser processada e então redirecionar
      setTimeout(() => {
        // Usar window.location para garantir que a página seja recarregada completamente
        // Isso garante que os mercados sejam recarregados do contrato
        const basePath = process.env.NODE_ENV === 'production' ? '/arcsight' : '';
        window.location.href = `${basePath}/`;
      }, 3000); // Aumentar para 3 segundos para dar tempo da transação ser processada
    } catch (err: any) {
      clearTimeout(timeoutId);
      setIsSubmitting(false); // Sempre atualizar o estado em caso de erro
      
      console.error("[handleSubmit] Erro ao criar mercado:", err);
      console.error("[handleSubmit] Erro completo:", JSON.stringify(err, null, 2));
      
      if (err.message?.includes("timeout") || err.message?.includes("Timed out")) {
        const hashMatch = err.message?.match(/0x[a-fA-F0-9]{64}/);
        if (hashMatch) {
          setTxHash(hashMatch[0]);
        }
        setError(
          "A transação foi enviada, mas está aguardando confirmação. " +
          "Recarregue a página em alguns instantes para verificar se foi criada."
        );
      } else if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied") || err.message?.includes("User rejected")) {
        setError("Transação cancelada pelo usuário");
      } else if (err.message?.includes("insufficient funds") || err.message?.includes("saldo")) {
        setError("Saldo insuficiente. Verifique se você tem USDC suficiente na carteira.");
      } else {
        setError(err.message || "Erro ao criar mercado. Verifique o console para mais detalhes.");
      }
    }
  }

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

        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg space-y-6">
          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagem do Mercado (Opcional)
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-400">
                    Clique para fazer upload de uma imagem
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WEBP ou GIF (máx. 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
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

          <div>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              {isSubmitting ? "Criando..." : "Criar Mercado"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isSubmitting) {
                  // Se estiver criando, apenas mostrar aviso
                  if (confirm("A criação está em andamento. Deseja realmente cancelar? A transação pode continuar sendo processada.")) {
                    setIsSubmitting(false);
                    setError(null);
                    router.push("/");
                  }
                } else {
                  router.push("/");
                }
              }}
              disabled={false}
              className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition"
            >
              {isSubmitting ? "Cancelar (Aviso)" : "Cancelar"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
