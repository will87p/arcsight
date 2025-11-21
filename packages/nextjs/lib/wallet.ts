"use client";

import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther, defineChain } from "viem";

// Configuração da rede - pode ser alterada via variáveis de ambiente
// Para usar Arc Network, defina NEXT_PUBLIC_NETWORK=arc no .env.local
const network = process.env.NEXT_PUBLIC_NETWORK || "hardhat";

// Debug: mostrar qual rede está sendo usada
if (typeof window !== "undefined") {
  console.log("[wallet.ts] Rede configurada:", network);
  console.log("[wallet.ts] NEXT_PUBLIC_NETWORK:", process.env.NEXT_PUBLIC_NETWORK);
}

// Configuração da rede Arc (Testnet)
// Nota: A Arc Network usa USDC como moeda nativa com 18 decimais
const arcChain = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "5042002"), // Arc Testnet Chain ID
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18, // USDC na Arc tem 18 decimais
    name: "USD Coin",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
});

// Configuração do Hardhat local (padrão)
const hardhatChain = defineChain({
  id: 1337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

// Exporta a chain baseada na configuração
export const chain = network === "arc" ? arcChain : hardhatChain;

// Cliente público para leitura
export function getPublicClient() {
  const rpcUrl = network === "arc" 
    ? (process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network")
    : "http://127.0.0.1:8545";
    
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

// Cliente de carteira para transações
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask não está instalado");
  }

  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}

// Conectar carteira
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask não está instalado");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0] as `0x${string}`;
}

// Revogar permissões da carteira
export async function revokePermissions(): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    return;
  }

  try {
    // Método 1: Tenta revogar permissões usando wallet_revokePermissions (se disponível)
    // Isso está disponível em versões mais recentes do MetaMask
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
    console.log("Permissões revogadas com sucesso");
  } catch (err: any) {
    // Se não estiver disponível, tenta método alternativo
    console.log("wallet_revokePermissions não disponível, tentando método alternativo");
    
    // Método 2: Tenta obter permissões atuais e depois solicitar novamente
    // Isso pode forçar uma nova seleção em algumas versões
    try {
      const permissions = await window.ethereum.request({
        method: "wallet_getPermissions",
      });
      
      // Se houver permissões, tenta revogá-las uma por uma
      if (permissions && permissions.length > 0) {
        // Não há método direto para revogar, então apenas logamos
        console.log("Permissões atuais encontradas, será necessário solicitar novamente");
      }
    } catch (getPermsErr) {
      // Ignora erro ao obter permissões
      console.log("Não foi possível obter permissões atuais");
    }
  }
}

// Trocar conta (força nova seleção)
export async function switchAccount(): Promise<`0x${string}`> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask não está instalado");
  }

  // Primeiro tenta revogar permissões para forçar nova seleção
  await revokePermissions();
  
  // Aguarda um pouco para garantir que as permissões foram processadas
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Método 1: Tenta usar wallet_requestPermissions
  // Em algumas versões do MetaMask, isso mostra o seletor de contas mesmo com permissão existente
  try {
    const permissions = await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    
    // Se retornou permissões, obtém as contas
    if (permissions && permissions.length > 0) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      
      if (accounts && accounts.length > 0) {
        return accounts[0] as `0x${string}`;
      }
    }
  } catch (err: any) {
    // Se o usuário rejeitou (código 4001), relança o erro
    if (err.code === 4001) {
      throw new Error("Troca de conta cancelada pelo usuário");
    }
    // Se outro erro, tenta método alternativo
    console.log("wallet_requestPermissions não funcionou, tentando eth_requestAccounts");
  }
  
  // Método 2: Fallback - usa eth_requestAccounts
  // Se as permissões foram revogadas, isso deve mostrar o popup
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("Nenhuma conta foi selecionada. Por favor, selecione uma conta no MetaMask.");
    }

    return accounts[0] as `0x${string}`;
  } catch (err: any) {
    if (err.code === 4001) {
      throw new Error("Troca de conta cancelada pelo usuário");
    }
    throw new Error(err.message || "Erro ao trocar conta. Tente desconectar e conectar novamente.");
  }
}

// Obter endereço conectado
export async function getConnectedAddress(): Promise<`0x${string}` | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    return accounts[0] as `0x${string}` | null;
  } catch {
    return null;
  }
}

// Utilitários
export { formatEther, parseEther };

// Extensão do Window para TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

