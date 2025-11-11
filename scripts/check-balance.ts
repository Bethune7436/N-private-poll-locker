import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n=== Wallet Info ===");
  console.log(`Address: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("==================\n");

  if (balance === 0n) {
    console.log("⚠️  Warning: Balance is 0! You need Sepolia ETH to deploy.");
    console.log("💰 Get free Sepolia ETH from faucets:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("\n=== Wallet Info ===");
  console.log(`Address: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("==================\n");

  if (balance === 0n) {
    console.log("⚠️  Warning: Balance is 0! You need Sepolia ETH to deploy.");
    console.log("💰 Get free Sepolia ETH from faucets:");
    console.log("   - https://sepoliafaucet.com/");
    console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


