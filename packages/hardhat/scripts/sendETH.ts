import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("📋 Contas disponíveis no Hardhat:");
  console.log(`   Conta 1 (com ETH): ${signer.address}`);
  
  // Tenta pegar o endereço dos argumentos ou variável de ambiente
  const recipientAddress = process.argv[2] || process.env.RECIPIENT_ADDRESS;
  
  if (!recipientAddress) {
    console.log("\n❌ Por favor, forneça o endereço da sua carteira:");
    console.log("   $env:RECIPIENT_ADDRESS='SEU_ENDERECO'; npm run fund");
    console.log("\n💡 Para obter seu endereço:");
    console.log("   1. Abra o MetaMask");
    console.log("   2. Clique no nome da conta");
    console.log("   3. Copie o endereço (começa com 0x...)");
    process.exit(1);
  }

  // Validar formato do endereço
  if (!ethers.isAddress(recipientAddress)) {
    console.log("❌ Endereço inválido. Certifique-se de que começa com 0x e tem 42 caracteres.");
    process.exit(1);
  }

  try {
    console.log(`\n📤 Enviando 100 ETH para: ${recipientAddress}`);
    
    // Verifica o saldo antes
    const balanceBefore = await ethers.provider.getBalance(recipientAddress);
    console.log(`💰 Saldo antes: ${ethers.formatEther(balanceBefore)} ETH`);

    // Envia 100 ETH
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther("100"),
    });

    console.log(`\n📤 Transação enviada: ${tx.hash}`);
    console.log("⏳ Aguardando confirmação...");

    await tx.wait();
    console.log("✅ Transação confirmada!");

    // Verifica o saldo depois
    const balanceAfter = await ethers.provider.getBalance(recipientAddress);
    console.log(`\n💰 Saldo depois: ${ethers.formatEther(balanceAfter)} ETH`);
    console.log(`\n🎉 ${ethers.formatEther(balanceAfter - balanceBefore)} ETH foram enviados com sucesso!`);
  } catch (error: any) {
    console.error("❌ Erro ao enviar ETH:", error.message);
    if (error.message.includes("network")) {
      console.error("\n💡 Certifique-se de que o nó Hardhat está rodando:");
      console.error("   npm run node");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

