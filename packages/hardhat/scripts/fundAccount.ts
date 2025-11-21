import { ethers } from "hardhat";

async function main() {
  // A primeira conta do Hardhat sempre tem muito ETH
  // Pegamos ela usando getSigners
  const [signer] = await ethers.getSigners();
  
  // Endereço da conta que precisa de ETH (substitua pelo seu endereço)
  const recipientAddress = process.argv[2];
  
  if (!recipientAddress) {
    console.log("❌ Por favor, forneça o endereço da carteira como argumento:");
    console.log("   npm run fund -- <SEU_ENDERECO>");
    console.log("\nExemplo:");
    console.log("   npm run fund -- 0x1234567890123456789012345678901234567890");
    process.exit(1);
  }

  try {
    // Verifica o saldo antes
    const balanceBefore = await ethers.provider.getBalance(recipientAddress);
    console.log(`\n💰 Saldo antes: ${ethers.formatEther(balanceBefore)} ETH`);

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
    console.log(`\n🎉 ${ethers.formatEther(balanceAfter - balanceBefore)} ETH foram enviados!`);
  } catch (error: any) {
    console.error("❌ Erro ao enviar ETH:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
