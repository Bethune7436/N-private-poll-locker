/**
 * Test MultiChoiceVoting contract on Sepolia testnet
 * Usage: npx hardhat run scripts/test-sepolia.ts --network sepolia
 */

import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xf5c1F62b602cCf3545ff5ed90e7eC7032915fE8D";
  
  console.log(`\n🧪 Testing MultiChoiceVoting on Sepolia Testnet...\n`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);

  const [deployer] = await ethers.getSigners();
  console.log(`Testing with account: ${deployer.address}`);
  
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  try {
    // Test 1: Get poll count
    console.log("\n📊 Test 1: Getting poll count...");
    const pollCount = await voting.getPollCount();
    console.log(`✅ Poll count: ${pollCount}`);

    // Test 2: Create a poll
    console.log("\n📝 Test 2: Creating a test poll...");
    const title = "Which blockchain do you prefer?";
    const options = ["Ethereum", "Polygon", "Arbitrum"];
    const startTime = Math.floor(Date.now() / 1000); // Now
    const endTime = startTime + 3600; // 1 hour from now

    const createTx = await voting.createPoll(title, options, startTime, endTime);
    console.log(`📤 Transaction sent: ${createTx.hash}`);
    console.log(`   Etherscan: https://sepolia.etherscan.io/tx/${createTx.hash}`);
    
    const receipt = await createTx.wait();
    console.log(`✅ Poll created! Gas used: ${receipt?.gasUsed.toString()}`);

    // Test 3: Get new poll info
    console.log("\n📋 Test 3: Getting poll info...");
    const newPollId = Number(pollCount); // New poll ID
    const pollInfo = await voting.getPollInfo(newPollId);
    
    console.log(`✅ Poll Info:`);
    console.log(`   Title: ${pollInfo[0]}`);
    console.log(`   Options: ${pollInfo[1].join(", ")}`);
    console.log(`   Creator: ${pollInfo[4]}`);
    console.log(`   Total Voters: ${pollInfo[7]}`);

    console.log("\n✅ All tests passed! Contract is working correctly on Sepolia.");
    console.log(`\n📱 You can now test the frontend by connecting to Sepolia network!`);

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


 * Usage: npx hardhat run scripts/test-sepolia.ts --network sepolia
 */

import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xf5c1F62b602cCf3545ff5ed90e7eC7032915fE8D";
  
  console.log(`\n🧪 Testing MultiChoiceVoting on Sepolia Testnet...\n`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);

  const [deployer] = await ethers.getSigners();
  console.log(`Testing with account: ${deployer.address}`);
  
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  try {
    // Test 1: Get poll count
    console.log("\n📊 Test 1: Getting poll count...");
    const pollCount = await voting.getPollCount();
    console.log(`✅ Poll count: ${pollCount}`);

    // Test 2: Create a poll
    console.log("\n📝 Test 2: Creating a test poll...");
    const title = "Which blockchain do you prefer?";
    const options = ["Ethereum", "Polygon", "Arbitrum"];
    const startTime = Math.floor(Date.now() / 1000); // Now
    const endTime = startTime + 3600; // 1 hour from now

    const createTx = await voting.createPoll(title, options, startTime, endTime);
    console.log(`📤 Transaction sent: ${createTx.hash}`);
    console.log(`   Etherscan: https://sepolia.etherscan.io/tx/${createTx.hash}`);
    
    const receipt = await createTx.wait();
    console.log(`✅ Poll created! Gas used: ${receipt?.gasUsed.toString()}`);

    // Test 3: Get new poll info
    console.log("\n📋 Test 3: Getting poll info...");
    const newPollId = Number(pollCount); // New poll ID
    const pollInfo = await voting.getPollInfo(newPollId);
    
    console.log(`✅ Poll Info:`);
    console.log(`   Title: ${pollInfo[0]}`);
    console.log(`   Options: ${pollInfo[1].join(", ")}`);
    console.log(`   Creator: ${pollInfo[4]}`);
    console.log(`   Total Voters: ${pollInfo[7]}`);

    console.log("\n✅ All tests passed! Contract is working correctly on Sepolia.");
    console.log(`\n📱 You can now test the frontend by connecting to Sepolia network!`);

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

