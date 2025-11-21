import { ethers } from "hardhat";

async function main() {
  console.log("Deploying PredictionMarket contract to Arc Network...");

  // Verificar se a chave privada está configurada
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY não está configurada no arquivo .env");
  }

  // Determinar qual rede usar baseado no argumento --network
  const network = process.argv.includes("--network") 
    ? process.argv[process.argv.indexOf("--network") + 1]
    : "arcTestnet";

  console.log(`Deployando na rede: ${network}`);

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  
  // Usar o signer configurado na rede
  const [deployer] = await ethers.getSigners();
  console.log(`Deployando com a conta: ${deployer.address}`);
  
  // Verificar saldo
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Saldo da conta: ${ethers.formatEther(balance)} ETH/USDC`);
  
  if (balance === 0n) {
    console.warn("⚠️ ATENÇÃO: A conta não tem saldo! Obtenha USDC no faucet: https://faucet.circle.com");
  }
  
  const predictionMarket = await PredictionMarket.deploy();

  await predictionMarket.waitForDeployment();

  const address = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to Arc Network at:", address);
  console.log("\n📋 Próximos passos:");
  console.log("1. Atualize o arquivo .env.local do Next.js com:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("2. Configure NEXT_PUBLIC_NETWORK=arc no .env.local");
  console.log("3. Configure NEXT_PUBLIC_ARC_RPC_URL e NEXT_PUBLIC_ARC_CHAIN_ID");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

