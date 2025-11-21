import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Verificar se há código no endereço
  const code = await provider.getCode(contractAddress);
  
  if (code === "0x" || code === "0x0") {
    console.log("❌ Nenhum contrato encontrado no endereço", contractAddress);
    console.log("💡 Fazendo deploy do contrato...");
    
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();
    const address = await predictionMarket.getAddress();
    
    console.log("✅ Contrato deployado em:", address);
  } else {
    console.log("✅ Contrato encontrado no endereço", contractAddress);
    console.log("📦 Tamanho do código:", code.length, "bytes");
    
    // Tentar chamar uma função do contrato para verificar
    try {
      const contract = await ethers.getContractAt("PredictionMarket", contractAddress);
      const marketCounter = await contract.marketCounter();
      console.log("✅ Contrato funcionando! Market counter:", marketCounter.toString());
    } catch (err: any) {
      console.log("⚠️ Contrato encontrado mas não responde:", err.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

