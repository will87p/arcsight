"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/lib/useWallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatAddress } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Atualizar busca quando o query mudar
  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  const handleDisconnect = async () => {
    setIsDropdownOpen(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    await disconnect();
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo e Navegação */}
          <div className="flex items-center gap-8 w-full md:w-auto">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hover:from-blue-300 hover:to-blue-500 transition">
              ArcSight
            </Link>
            
            {/* Links de navegação */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-300 hover:text-white transition font-medium">
                {t.header.markets}
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-white transition font-medium">
                {t.header.createMarket}
              </Link>
            </nav>
          </div>

          {/* Busca, Idioma e Carteira */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Campo de Busca */}
            <div className="flex-1 md:flex-none md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.header.searchMarkets}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Seletor de Idioma */}
            <LanguageSelector />

            {/* Botão Faucet - USDC */}
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition font-semibold text-sm shadow-lg hover:shadow-green-500/50 whitespace-nowrap flex items-center gap-2"
              title="Obter USDC de teste na rede Arc Testnet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.header.faucetUSDC}
            </a>

            {/* Botão Conectar Carteira */}
            {isConnected && address ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{formatAddress(address)}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">{t.header.walletConnected}</p>
                      <p className="text-sm text-gray-200 font-mono break-all">{address}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={copyAddress}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t.header.copyAddress}
                      </button>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleDisconnect}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t.header.disconnect}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 whitespace-nowrap"
              >
                {isConnecting ? t.header.connecting : t.header.connectWallet}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
