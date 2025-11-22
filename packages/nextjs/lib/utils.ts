import { Address } from "viem";
import { formatEther } from "./wallet";

export function formatAddress(address: Address | string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeRemaining(timestamp: bigint | number): string {
  const now = Math.floor(Date.now() / 1000);
  const future = Number(timestamp);
  const diff = future - now;

  if (diff <= 0) {
    return "Tempo esgotado";
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) {
    return `${days} dia${days > 1 ? "s" : ""} e ${hours} hora${hours > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? "s" : ""} e ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  } else {
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }
}

export function formatEtherValue(value: bigint | string): string {
  try {
    const numValue = typeof value === "string" ? BigInt(value) : value;
    return formatEther(numValue);
  } catch {
    return "0";
  }
}

// Helper para gerar URLs que respeitam o basePath
export function getMarketUrl(marketId: number | bigint): string {
  // Em produção no GitHub Pages, o basePath é /arcsight
  // Mas o Next.js Link já adiciona o basePath automaticamente, então não precisamos adicionar manualmente
  // Retornamos apenas o caminho relativo e deixamos o Next.js cuidar do basePath
  return `/market/${Number(marketId)}`;
}
