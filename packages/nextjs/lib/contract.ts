// ABI do contrato PredictionMarket
export const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "uint256", name: "_resolutionTime", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_marketId", type: "uint256" },
      { internalType: "bool", name: "_outcome", type: "bool" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_marketId", type: "uint256" },
      { internalType: "bool", name: "_winningOutcome", type: "bool" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "deleteMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "markets",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "resolutionTime", type: "uint256" },
      { internalType: "address", name: "oracle", type: "address" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "bool", name: "winningOutcome", type: "bool" },
      { internalType: "uint256", name: "totalYesAmount", type: "uint256" },
      { internalType: "uint256", name: "totalNoAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "yesBets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "noBets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "resolutionTime", type: "uint256" },
          { internalType: "address", name: "oracle", type: "address" },
          { internalType: "bool", name: "resolved", type: "bool" },
          { internalType: "bool", name: "winningOutcome", type: "bool" },
          { internalType: "uint256", name: "totalYesAmount", type: "uint256" },
          { internalType: "uint256", name: "totalNoAmount", type: "uint256" },
        ],
        internalType: "struct PredictionMarket.Market",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_marketId", type: "uint256" }],
    name: "getTotalPot",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "description", type: "string" },
      { indexed: false, internalType: "uint256", name: "resolutionTime", type: "uint256" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bool", name: "outcome", type: "bool" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BetPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "winningOutcome", type: "bool" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "WinningsClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "marketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
    ],
    name: "MarketDeleted",
    type: "event",
  },
] as const;

// Endereço do contrato (será atualizado após deploy)
// Para desenvolvimento local, use o endereço retornado pelo deploy
// Fallback para desenvolvimento local se a variável de ambiente não estiver disponível
const envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CONTRACT_ADDRESS = envAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Debug: verificar se a variável está sendo carregada
if (typeof window !== "undefined") {
  console.log("[contract.ts] CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
  console.log("[contract.ts] NEXT_PUBLIC_CONTRACT_ADDRESS (env):", envAddress);
  console.log("[contract.ts] NEXT_PUBLIC_NETWORK:", process.env.NEXT_PUBLIC_NETWORK);
  
  // Aviso se estiver usando fallback do Hardhat
  if (!envAddress) {
    console.warn("[contract.ts] ⚠️ ATENÇÃO: Usando endereço fallback do Hardhat local!");
    console.warn("[contract.ts] Configure NEXT_PUBLIC_CONTRACT_ADDRESS no .env.local");
  }
}

