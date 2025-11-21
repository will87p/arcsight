import { ethers } from "hardhat";

async function main() {
  const address = process.argv[2] || "0x7811755f5f72907ef178e5d4e4d8472f7149e0d6";
  
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const balance = await provider.getBalance(address);
  
  console.log(`\n💰 Saldo da conta ${address}:`);
  console.log(`   ${ethers.formatEther(balance)} ETH\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
