"use client";

import Link from "next/link";
import { formatEther } from "viem";

interface Market {
  id: bigint;
  creator: `0x${string}`;
  description: string;
  resolutionTime: bigint;
  oracle: `0x${string}`;
  resolved: boolean;
  winningOutcome: boolean;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
}

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const totalPot = market.totalYesAmount + market.totalNoAmount;
  const resolutionDate = new Date(Number(market.resolutionTime) * 1000);
  const isOpen = !market.resolved && Date.now() < resolutionDate.getTime();

  return (
    <Link href={`/market/${market.id.toString()}`}>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-800">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
            {market.description}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOpen
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {isOpen ? "Aberto" : "Resolvido"}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Pote Total:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatEther(totalPot)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span>SIM:</span>
            <span>{formatEther(market.totalYesAmount)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>NÃO:</span>
            <span>{formatEther(market.totalNoAmount)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Resolução:</span>
            <span>{resolutionDate.toLocaleString()}</span>
          </div>
        </div>

        {market.resolved && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium">
              Resultado: {market.winningOutcome ? "SIM" : "NÃO"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

