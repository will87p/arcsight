"use client";

import { useState, useEffect, useCallback } from "react";
import { getConnectedAddress, connectWallet, revokePermissions, getPublicClient, getWalletClient } from "./wallet";
import { CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from "./contract";
import { formatEther, parseEther, Address } from "viem";

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const addr = await getConnectedAddress();
      setAddress(addr);
    } catch (err) {
      console.error("Erro ao verificar conexão:", err);
      setAddress(null);
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
    } else {
      setAddress(accounts[0] as Address);
    }
  }, []);

  // Verificar conexão ao montar
  useEffect(() => {
    checkConnection();
    
    // Ouvir mudanças de conta
    if (typeof window !== "undefined" && window.ethereum) {
      const ethereum = window.ethereum;
      
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      
      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", () => window.location.reload());
      };
    }
  }, [checkConnection, handleAccountsChanged]);

  async function connect() {
    setIsConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      setError(err.message || "Erro ao conectar carteira");
      console.error("Erro ao conectar:", err);
      setAddress(null);
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnect() {
    // Revoga permissões para que na próxima conexão solicite assinatura novamente
    await revokePermissions();
    
    // Limpa o estado local
    setAddress(null);
    setError(null);
  }

  return {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}

