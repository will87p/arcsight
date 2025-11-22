"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicClient, getWalletClient } from "./wallet";
import { parseEther, encodeFunctionData } from "viem";
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from "./contract";
import { Address } from "viem";
import { useWallet } from "./useWallet";

export interface Market {
  id: bigint;
  creator: Address;
  description: string;
  resolutionTime: bigint;
  oracle: Address;
  resolved: boolean;
  winningOutcome: boolean;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
}

export function useContract() {
  const { address, isConnected } = useWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os mercados
  const fetchMarkets = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("Endereço do contrato não configurado");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const publicClient = getPublicClient();
      
      // Verificar qual rede está sendo usada primeiro
      const chainId = await publicClient.getChainId();
      const isArcNetwork = chainId === 5042002;
      console.log(`[fetchMarkets] Chain ID da rede: ${chainId}`);
      console.log(`[fetchMarkets] Rede esperada: ${process.env.NEXT_PUBLIC_NETWORK || "hardhat"}`);
      
      if (chainId === 5042002 && process.env.NEXT_PUBLIC_NETWORK !== "arc") {
        console.warn("[fetchMarkets] ⚠️ ATENÇÃO: Você está na rede Arc (5042002) mas NEXT_PUBLIC_NETWORK não está configurado como 'arc'!");
        console.warn("[fetchMarkets] Configure NEXT_PUBLIC_NETWORK=arc no .env.local");
      }
      
      if (chainId === 1337 && process.env.NEXT_PUBLIC_NETWORK === "arc") {
        console.warn("[fetchMarkets] ⚠️ ATENÇÃO: Você está na rede Hardhat (1337) mas NEXT_PUBLIC_NETWORK está configurado como 'arc'!");
        console.warn("[fetchMarkets] Verifique se o MetaMask está conectado à rede Arc Testnet");
      }
      
      // Tenta ler o marketCounter diretamente
      // Se retornar erro ou "0x", o contrato pode não existir ou ser diferente
      let marketCount: bigint | null = null;
      
      try {
        marketCount = await publicClient.readContract({
          address: CONTRACT_ADDRESS as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: "marketCounter",
        }) as bigint;
        console.log("[fetchMarkets] ✅ marketCounter lido com sucesso:", marketCount.toString());
      } catch (readError: any) {
        console.error("[fetchMarkets] ❌ Erro ao ler marketCounter:", readError);
        
        // Se o erro for "returned no data" ou "0x", o contrato pode não ter essa função
        if (readError.message?.includes("returned no data") || 
            readError.message?.includes("0x") ||
            readError.message?.includes("does not have the function")) {
          
          const errorMsg = isArcNetwork
            ? `O contrato no endereço ${CONTRACT_ADDRESS} na rede Arc Testnet não possui a função "marketCounter". ` +
              `Isso pode significar que:\n` +
              `1. O contrato não foi deployado corretamente na Arc\n` +
              `2. O endereço do contrato está incorreto\n` +
              `3. O contrato na Arc é diferente do contrato local\n\n` +
              `Verifique no explorador: https://testnet.arcscan.app/address/${CONTRACT_ADDRESS}\n` +
              `E faça o deploy do contrato na Arc usando: npm run deploy:arc:testnet`
            : `O contrato no endereço ${CONTRACT_ADDRESS} não possui a função "marketCounter". ` +
              `O nó Hardhat pode ter sido reiniciado. ` +
              `Execute: cd packages/hardhat && npx hardhat run scripts/deploy.ts`;
          
          setError(errorMsg);
          setIsLoading(false);
          return;
        }
        
        // Se for outro tipo de erro, relança
        throw readError;
      }
      
      // Se marketCount for null ou undefined, também é um erro
      if (marketCount === null || marketCount === undefined) {
        const errorMsg = isArcNetwork
          ? `Não foi possível ler o marketCounter do contrato na rede Arc. ` +
            `Verifique se o contrato foi deployado: https://testnet.arcscan.app/address/${CONTRACT_ADDRESS}`
          : `Não foi possível ler o marketCounter. Verifique se o contrato está deployado.`;
        
        setError(errorMsg);
        setIsLoading(false);
        return;
      }
      console.log(`[fetchMarkets] Chain ID da rede: ${chainId}`);
      console.log(`[fetchMarkets] Rede esperada: ${process.env.NEXT_PUBLIC_NETWORK || "hardhat"}`);
      
      if (chainId === 5042002 && process.env.NEXT_PUBLIC_NETWORK !== "arc") {
        console.warn("[fetchMarkets] ⚠️ ATENÇÃO: Você está na rede Arc (5042002) mas NEXT_PUBLIC_NETWORK não está configurado como 'arc'!");
        console.warn("[fetchMarkets] Configure NEXT_PUBLIC_NETWORK=arc no .env.local");
      }
      
      if (chainId === 1337 && process.env.NEXT_PUBLIC_NETWORK === "arc") {
        console.warn("[fetchMarkets] ⚠️ ATENÇÃO: Você está na rede Hardhat (1337) mas NEXT_PUBLIC_NETWORK está configurado como 'arc'!");
        console.warn("[fetchMarkets] Verifique se o MetaMask está conectado à rede Arc Testnet");
      }

      // marketCount já foi lido acima, então usamos ele diretamente
      const count = Number(marketCount);
      console.log(`[fetchMarkets] Total de mercados encontrados: ${count}`);
      console.log(`[fetchMarkets] Endereço do contrato: ${CONTRACT_ADDRESS}`);
      
      if (count === 0) {
        console.log("[fetchMarkets] Nenhum mercado encontrado");
        setMarkets([]);
        setIsLoading(false);
        return;
      }

      const marketPromises = [];
      for (let i = 1; i <= count; i++) {
        marketPromises.push(
          publicClient.readContract({
            address: CONTRACT_ADDRESS as Address,
            abi: PREDICTION_MARKET_ABI,
            functionName: "getMarket",
            args: [BigInt(i)],
          }).catch((err) => {
            console.error(`[fetchMarkets] Erro ao buscar mercado ${i}:`, err);
            return null;
          })
        );
      }

      const marketData = await Promise.all(marketPromises);
      console.log(`[fetchMarkets] Dados brutos recebidos:`, marketData);
      
      const validMarkets = marketData
        .filter((market) => market !== null) // Filtrar erros
        .map((market, index) => ({
          ...market,
          id: BigInt(index + 1),
        }))
        .filter((market) => {
          // Filtrar mercados vazios ou inválidos
          const isValid = market && market.description && market.description.trim() !== "";
          if (!isValid) {
            console.log(`[fetchMarkets] Mercado ${market.id} filtrado (inválido ou vazio)`);
          }
          return isValid;
        });

      console.log(`[fetchMarkets] Mercados válidos:`, validMarkets.length);
      console.log(`[fetchMarkets] Lista final:`, validMarkets);
      setMarkets(validMarkets as Market[]);
    } catch (err: any) {
      console.error("Erro ao buscar mercados:", err);
      
      // Mensagens de erro mais específicas
      if (err.message?.includes("returned no data") || err.message?.includes("0x")) {
        setError(
          "Não foi possível conectar ao contrato. Verifique:\n" +
          "1. O nó Hardhat está rodando? (npx hardhat node)\n" +
          "2. O MetaMask está conectado à rede 'Hardhat Local' (Chain ID 1337)?\n" +
          "3. O contrato foi deployado no endereço correto?"
        );
      } else {
        setError(err.message || "Erro ao buscar mercados");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar um mercado específico
  const fetchMarket = useCallback(async (marketId: number): Promise<Market | null> => {
    if (!CONTRACT_ADDRESS) {
      setError("Endereço do contrato não configurado");
      return null;
    }

    try {
      const publicClient = getPublicClient();
      const market = await publicClient.readContract({
        address: CONTRACT_ADDRESS as Address,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarket",
        args: [BigInt(marketId)],
      });

      return {
        ...market,
        id: BigInt(marketId),
      } as Market;
    } catch (err: any) {
      setError(err.message || "Erro ao buscar mercado");
      console.error("Erro ao buscar mercado:", err);
      return null;
    }
  }, []);

  // Criar mercado
  const createMarket = useCallback(
    async (description: string, resolutionTime: number) => {
      // Verificar conexão novamente antes de executar
      if (!isConnected || !address) {
        // Tentar obter o endereço diretamente do MetaMask
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              // Se encontrou conta, usar ela mesmo que o estado não esteja sincronizado
              const currentAddress = accounts[0] as Address;
              if (!CONTRACT_ADDRESS) {
                throw new Error("Endereço do contrato não configurado");
              }
              // Continuar com a transação usando o endereço encontrado
              return await executeCreateMarket(description, resolutionTime, currentAddress);
            }
          } catch (err) {
            console.error("Erro ao verificar contas:", err);
          }
        }
        throw new Error("Carteira não conectada. Por favor, conecte sua carteira primeiro.");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error("Endereço do contrato não configurado");
      }

      return await executeCreateMarket(description, resolutionTime, address);
    },
    [isConnected, address, fetchMarkets]
  );

  // Função auxiliar para executar a criação do mercado
  async function executeCreateMarket(
    description: string,
    resolutionTime: number,
    walletAddress: Address
  ) {
    try {
      const publicClient = getPublicClient();

      // Usar eth_sendTransaction diretamente para contornar problemas do MetaMask
      // Isso evita o bug do botão "Review alert" que não funciona
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask não está instalado");
      }

        // Codificar os dados da função
        const data = encodeFunctionData({
          abi: PREDICTION_MARKET_ABI,
          functionName: "createMarket",
          args: [description, BigInt(resolutionTime)],
        });

        // Enviar transação diretamente via MetaMask
        // Deixamos o MetaMask calcular gas, gasPrice e nonce automaticamente
        // Isso evita alertas e problemas de compatibilidade
        console.log("[executeCreateMarket] Enviando transação...");
        console.log("[executeCreateMarket] From:", walletAddress);
        console.log("[executeCreateMarket] To:", CONTRACT_ADDRESS);
        console.log("[executeCreateMarket] Data:", data);
        
        let hash: string;
        try {
          hash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: walletAddress,
                to: CONTRACT_ADDRESS,
                data: data,
                // Não especificamos gas, gasPrice ou nonce - deixa o MetaMask calcular
                // Isso deve resolver o problema do alerta
              },
            ],
          }) as string;
        } catch (requestError: any) {
          console.error("[executeCreateMarket] Erro ao enviar transação:", requestError);
          // Se o erro for de rejeição do usuário
          if (requestError.code === 4001 || requestError.message?.includes("rejected") || requestError.message?.includes("denied") || requestError.message?.includes("User rejected")) {
            throw new Error("Transação cancelada pelo usuário");
          }
          throw requestError;
        }

        if (!hash || hash === '0x' || hash.length !== 66) {
          throw new Error("Hash da transação inválido recebido do MetaMask");
        }

        console.log("[executeCreateMarket] Transação enviada, hash:", hash);

        // Retornar o hash imediatamente e confirmar em background
        // Isso evita bloquear a UI enquanto espera a confirmação
        const confirmInBackground = async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: hash as `0x${string}`,
              timeout: 60_000, // 1 minuto de timeout
              pollingInterval: 2_000, // Verificar a cada 2 segundos
            });
            
            console.log("Transação confirmada:", receipt);
            
            // Verificar se a transação foi bem-sucedida
            if (receipt.status === "reverted") {
              console.error("Transação foi revertida");
            } else {
              // Atualizar lista de mercados após confirmação
              await fetchMarkets();
            }
          } catch (waitError: any) {
            console.warn("Timeout ou erro aguardando confirmação:", waitError.message);
            
            // Tentar verificar o status da transação diretamente
            try {
              const receipt = await publicClient.getTransactionReceipt({ 
                hash: hash as `0x${string}` 
              });
              
              if (receipt) {
                console.log("Transação encontrada no explorador:", receipt);
                if (receipt.status === "success") {
                  await fetchMarkets();
                }
              }
            } catch (checkError) {
              console.log("Transação ainda não confirmada, mas foi enviada");
            }
            
            // Tentar atualizar os mercados após um delay
            setTimeout(() => fetchMarkets().catch(console.error), 3000);
          }
        };

        // Iniciar confirmação em background (não bloqueia)
        confirmInBackground().catch(console.error);
        
        console.log(`[createMarket] Transação enviada com hash: ${hash}`);
        console.log(`[createMarket] Endereço do contrato: ${CONTRACT_ADDRESS}`);
        
        // Retornar hash imediatamente para não bloquear a UI
        return hash as `0x${string}`;
      } catch (err: any) {
        // Se o erro for de rejeição do usuário
        if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied") || err.message?.includes("User rejected")) {
          throw new Error("Transação cancelada pelo usuário");
        }
        throw new Error(err.message || "Erro ao criar mercado");
      }
  }

  // Apostar
  const placeBet = useCallback(
    async (marketId: number, outcome: boolean, amount: string) => {
      if (!isConnected || !address) {
        throw new Error("Carteira não conectada");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error("Endereço do contrato não configurado");
      }

      try {
        // Validar e normalizar o valor
        const normalizedAmount = amount.replace(',', '.').trim();
        const amountValue = parseFloat(normalizedAmount);
        
        if (isNaN(amountValue) || amountValue <= 0) {
          throw new Error("Valor inválido. Use apenas números (ex: 0.1 ou 1.5)");
        }

        const publicClient = getPublicClient();

        // Usar eth_sendTransaction diretamente para contornar problemas do MetaMask
        if (typeof window === "undefined" || !window.ethereum) {
          throw new Error("MetaMask não está instalado");
        }

        // Converter para wei (18 decimais - mesmo formato do ETH/USDC na Arc)
        let value: bigint;
        try {
          value = parseEther(normalizedAmount);
        } catch (parseError: any) {
          throw new Error(`Erro ao converter valor: ${parseError.message || "Valor inválido"}`);
        }

        console.log(`[placeBet] Valor da aposta: ${normalizedAmount} USDC`);
        console.log(`[placeBet] Valor em wei: ${value.toString()}`);
        console.log(`[placeBet] Market ID: ${marketId}, Outcome: ${outcome}`);

        // Codificar os dados da função
        const data = encodeFunctionData({
          abi: PREDICTION_MARKET_ABI,
          functionName: "placeBet",
          args: [BigInt(marketId), outcome],
        });

        console.log(`[placeBet] Enviando transação...`);
        console.log(`[placeBet] From: ${address}`);
        console.log(`[placeBet] To: ${CONTRACT_ADDRESS}`);
        console.log(`[placeBet] Value: ${value.toString()}`);
        console.log(`[placeBet] Data: ${data}`);

        // Enviar transação diretamente via MetaMask
        // Converter valor para hex (formato que o MetaMask espera)
        // O valor deve ser uma string hex sem zeros à esquerda desnecessários
        let valueHex: string;
        try {
          // Converter bigint para hex string
          const hexString = value.toString(16);
          // Garantir que começa com 0x
          valueHex = hexString.startsWith('0x') ? hexString : `0x${hexString}`;
          // Remover zeros à esquerda desnecessários, mas manter pelo menos "0x0"
          if (valueHex === '0x0' || value === BigInt(0)) {
            valueHex = '0x0';
          }
        } catch (hexError: any) {
          console.error("[placeBet] Erro ao converter valor para hex:", hexError);
          throw new Error(`Erro ao converter valor para hex: ${hexError.message || "Valor inválido"}`);
        }
        
        console.log(`[placeBet] Valor em hex: ${valueHex}`);
        console.log(`[placeBet] Valor em wei (decimal): ${value.toString()}`);
        
        // Validar parâmetros antes de enviar
        if (!address || !CONTRACT_ADDRESS || !data) {
          throw new Error("Parâmetros inválidos para a transação");
        }
        
        let hash: string;
        try {
          console.log("[placeBet] Enviando transação para MetaMask...");
          console.log("[placeBet] Parâmetros:", {
            from: address,
            to: CONTRACT_ADDRESS,
            value: valueHex,
            dataLength: data.length
          });
          
          hash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: address,
                to: CONTRACT_ADDRESS,
                data: data,
                value: valueHex,
              },
            ],
          }) as string;
          
          console.log("[placeBet] Hash recebido do MetaMask:", hash);
        } catch (requestError: any) {
          console.error("[placeBet] Erro completo ao enviar transação:", requestError);
          console.error("[placeBet] Código do erro:", requestError.code);
          console.error("[placeBet] Mensagem do erro:", requestError.message);
          console.error("[placeBet] Stack do erro:", requestError.stack);
          
          // Se o erro for de rejeição do usuário
          if (requestError.code === 4001 || 
              requestError.message?.includes("rejected") || 
              requestError.message?.includes("denied") || 
              requestError.message?.includes("User rejected") ||
              requestError.message?.includes("user rejected")) {
            throw new Error("Transação cancelada pelo usuário");
          }
          
          // Se o erro for de saldo insuficiente
          if (requestError.message?.includes("insufficient funds") || 
              requestError.message?.includes("insufficient balance") ||
              requestError.code === -32000) {
            throw new Error("Saldo insuficiente. Verifique se você tem USDC suficiente na carteira.");
          }
          
          // Se o erro for de rede
          if (requestError.message?.includes("network") || 
              requestError.message?.includes("chain")) {
            throw new Error("Erro de rede. Verifique se está conectado à rede Arc Testnet.");
          }
          
          // Erro genérico com mensagem do MetaMask
          throw new Error(requestError.message || "Erro ao enviar transação para MetaMask");
        }

        if (!hash || hash === '0x' || hash.length !== 66) {
          throw new Error("Hash da transação inválido recebido do MetaMask");
        }

        console.log("[placeBet] Transação enviada, hash:", hash);

        // Retornar o hash imediatamente e confirmar em background
        const confirmInBackground = async () => {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: hash as `0x${string}`,
              timeout: 120_000, // 2 minutos
              pollingInterval: 2_000, // Verificar a cada 2 segundos
            });
            
            console.log("[placeBet] Transação confirmada:", receipt);
            
            if (receipt.status === "reverted") {
              console.error("[placeBet] Transação foi revertida");
            } else {
              // Atualizar lista de mercados após confirmação
              await fetchMarkets();
            }
          } catch (waitError: any) {
            console.warn("[placeBet] Timeout ou erro aguardando confirmação:", waitError.message);
            
            // Tentar verificar o status da transação diretamente
            try {
              const receipt = await publicClient.getTransactionReceipt({ 
                hash: hash as `0x${string}` 
              });
              
              if (receipt) {
                console.log("[placeBet] Transação encontrada no explorador:", receipt);
                if (receipt.status === "success") {
                  await fetchMarkets();
                }
              }
            } catch (checkError) {
              console.log("[placeBet] Transação ainda não confirmada, mas foi enviada");
            }
            
            // Tentar atualizar os mercados após um delay
            setTimeout(() => fetchMarkets().catch(console.error), 3000);
          }
        };

        // Iniciar confirmação em background (não bloqueia)
        confirmInBackground().catch(console.error);
        
        // Retornar hash imediatamente para não bloquear a UI
        return hash as `0x${string}`;
      } catch (err: any) {
        console.error("[placeBet] Erro completo:", err);
        throw new Error(err.message || "Erro ao fazer aposta");
      }
    },
    [isConnected, address, fetchMarkets]
  );

  // Resolver mercado
  const resolveMarket = useCallback(
    async (marketId: number, winningOutcome: boolean) => {
      if (!isConnected || !address) {
        throw new Error("Carteira não conectada");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error("Endereço do contrato não configurado");
      }

      try {
        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: "resolveMarket",
          args: [BigInt(marketId), winningOutcome],
          account: address,
        });

        console.log("Resolução enviada, hash:", hash);

        try {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 120_000, // 2 minutos
            pollingInterval: 2_000,
          });

          if (receipt.status === "reverted") {
            throw new Error("Transação foi revertida. Verifique se você é o oráculo do mercado.");
          }

          await fetchMarkets();
          return hash;
        } catch (waitError: any) {
          if (waitError.message?.includes("timeout") || waitError.message?.includes("Timed out")) {
            console.warn("Timeout aguardando confirmação, mas transação foi enviada:", hash);
            setTimeout(() => fetchMarkets(), 3000);
            return hash;
          }
          throw waitError;
        }
      } catch (err: any) {
        throw new Error(err.message || "Erro ao resolver mercado");
      }
    },
    [isConnected, address, fetchMarkets]
  );

  // Resgatar ganhos
  const claimWinnings = useCallback(
    async (marketId: number) => {
      if (!isConnected || !address) {
        throw new Error("Carteira não conectada");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error("Endereço do contrato não configurado");
      }

      try {
        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS as Address,
          abi: PREDICTION_MARKET_ABI,
          functionName: "claimWinnings",
          args: [BigInt(marketId)],
          account: address,
        });

        console.log("Resgate enviado, hash:", hash);

        try {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 120_000, // 2 minutos
            pollingInterval: 2_000,
          });

          if (receipt.status === "reverted") {
            throw new Error("Transação foi revertida. Verifique se você tem ganhos para resgatar.");
          }

          await fetchMarkets();
          return hash;
        } catch (waitError: any) {
          if (waitError.message?.includes("timeout") || waitError.message?.includes("Timed out")) {
            console.warn("Timeout aguardando confirmação, mas transação foi enviada:", hash);
            setTimeout(() => fetchMarkets(), 3000);
            return hash;
          }
          throw waitError;
        }
      } catch (err: any) {
        throw new Error(err.message || "Erro ao resgatar ganhos");
      }
    },
    [isConnected, address, fetchMarkets]
  );

  // Buscar apostas do usuário
  const getUserBets = useCallback(
    async (marketId: number): Promise<{ yesBet: bigint; noBet: bigint }> => {
      if (!isConnected || !address || !CONTRACT_ADDRESS) {
        return { yesBet: BigInt(0), noBet: BigInt(0) };
      }

      try {
        const publicClient = getPublicClient();
        const [yesBet, noBet] = await Promise.all([
          publicClient.readContract({
            address: CONTRACT_ADDRESS as Address,
            abi: PREDICTION_MARKET_ABI,
            functionName: "yesBets",
            args: [BigInt(marketId), address],
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS as Address,
            abi: PREDICTION_MARKET_ABI,
            functionName: "noBets",
            args: [BigInt(marketId), address],
          }),
        ]);

        return { yesBet: yesBet as bigint, noBet: noBet as bigint };
      } catch (err) {
        console.error("Erro ao buscar apostas:", err);
        return { yesBet: BigInt(0), noBet: BigInt(0) };
      }
    },
    [isConnected, address]
  );

  // Deletar mercado (apenas se não houver apostas)
  const deleteMarket = useCallback(
    async (marketId: number) => {
      // Verificar conexão novamente antes de executar
      if (!isConnected || !address) {
        // Tentar obter o endereço diretamente do MetaMask
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              const currentAddress = accounts[0] as Address;
              if (!CONTRACT_ADDRESS) {
                throw new Error("Endereço do contrato não configurado");
              }
              return await executeDeleteMarket(marketId, currentAddress);
            }
          } catch (err) {
            console.error("Erro ao verificar contas:", err);
          }
        }
        throw new Error("Carteira não conectada. Por favor, conecte sua carteira primeiro.");
      }

      if (!CONTRACT_ADDRESS) {
        throw new Error("Endereço do contrato não configurado");
      }

      return await executeDeleteMarket(marketId, address);
    },
    [isConnected, address, fetchMarkets]
  );

  // Função auxiliar para executar a exclusão do mercado
  async function executeDeleteMarket(marketId: number, walletAddress: Address) {
    try {
      const publicClient = getPublicClient();

      // Usar eth_sendTransaction diretamente para contornar problemas do MetaMask
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask não está instalado");
      }

      // Codificar os dados da função
      const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: "deleteMarket",
        args: [BigInt(marketId)],
      });

      // Enviar transação diretamente via MetaMask
      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: CONTRACT_ADDRESS,
            data: data,
            // Não especificamos gas, gasPrice ou nonce - deixa o MetaMask calcular
          },
        ],
      }) as string;

      console.log("Transação de exclusão enviada, hash:", hash);
      console.log(`[deleteMarket] Endereço do contrato usado: ${CONTRACT_ADDRESS}`);
      console.log(`[deleteMarket] Market ID: ${marketId}`);

      // Retornar o hash imediatamente e confirmar em background
      const confirmInBackground = async () => {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: hash as `0x${string}`,
            timeout: 120_000, // 2 minutos
            pollingInterval: 2_000, // Verificar a cada 2 segundos
          });
          
          console.log("Transação de exclusão confirmada:", receipt);
          
          // Verificar se a transação foi bem-sucedida
          if (receipt.status === "reverted") {
            console.error("Transação foi revertida");
            throw new Error("Transação foi revertida. Verifique se você é o criador e se não há apostas.");
          } else {
            // Atualizar lista de mercados após confirmação
            await fetchMarkets();
          }
        } catch (waitError: any) {
          console.warn("Timeout ou erro aguardando confirmação:", waitError.message);
          
          // Tentar verificar o status da transação diretamente
          try {
            const receipt = await publicClient.getTransactionReceipt({ 
              hash: hash as `0x${string}` 
            });
            
            if (receipt) {
              console.log("Transação encontrada no explorador:", receipt);
              if (receipt.status === "success") {
                await fetchMarkets();
              } else {
                throw new Error("Transação foi revertida. Verifique se você é o criador e se não há apostas.");
              }
            }
          } catch (checkError) {
            console.log("Transação ainda não confirmada, mas foi enviada");
          }
          
          // Tentar atualizar os mercados após um delay
          setTimeout(() => fetchMarkets().catch(console.error), 3000);
        }
      };

      // Iniciar confirmação em background (não bloqueia)
      confirmInBackground().catch(console.error);
      
      console.log(`[deleteMarket] Transação enviada com hash: ${hash}`);
      console.log(`[deleteMarket] Endereço do contrato: ${CONTRACT_ADDRESS}`);
      
      // Retornar hash imediatamente para não bloquear a UI
      return hash as `0x${string}`;
    } catch (err: any) {
      // Se o erro for de rejeição do usuário
      if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied") || err.message?.includes("User rejected")) {
        throw new Error("Transação cancelada pelo usuário");
      }
      // Se o erro for de revert do contrato
      if (err.message?.includes("revert") || err.message?.includes("reverted")) {
        throw new Error("Transação foi revertida. Verifique se você é o criador do mercado e se não há apostas.");
      }
      throw new Error(err.message || "Erro ao deletar mercado");
    }
  }

  useEffect(() => {
    if (CONTRACT_ADDRESS) {
      fetchMarkets();
    }
  }, [fetchMarkets]);

  return {
    markets,
    isLoading,
    error,
    fetchMarkets,
    fetchMarket,
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
    getUserBets,
    deleteMarket,
  };
}

