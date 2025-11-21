import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Rede Arc - Mainnet
    arc: {
      url: process.env.ARC_RPC_URL || "https://rpc.arc.network",
      chainId: parseInt(process.env.ARC_CHAIN_ID || "1243"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Rede Arc - Testnet
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: parseInt(process.env.ARC_TESTNET_CHAIN_ID || "5042002"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Arc Testnet requer minFeePerGas de 160 Gwei (~$0.01 por transação)
      // O Hardhat calculará automaticamente, mas garantimos o mínimo
      gasPrice: "auto",
      // Para garantir que transações sejam incluídas, use maxFeePerGas >= 160 Gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

