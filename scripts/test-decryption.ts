/**
 * Test script to finalize a poll and view decrypted results
 * Usage: npx hardhat run scripts/test-decryption.ts --network localhost
 */

import { ethers } from "hardhat";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  
  console.log(`\n🔍 Testing decryption for Poll #${pollId}...\n`);

  // Get contract
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  // Get poll info
  const pollInfo = await voting.getPollInfo(pollId);
  console.log("📊 Poll Info:");
  console.log(`  Title: ${pollInfo[0]}`);
  console.log(`  Options: ${pollInfo[1].join(", ")}`);
  console.log(`  Start: ${new Date(Number(pollInfo[2]) * 1000).toLocaleString()}`);
  console.log(`  End: ${new Date(Number(pollInfo[3]) * 1000).toLocaleString()}`);
  console.log(`  Finalized: ${pollInfo[5]}`);
  console.log(`  Total Voters: ${pollInfo[7]}`);
  console.log();

  // Check if already finalized
  if (pollInfo[5]) {
    console.log("✅ Poll already finalized!");
    const results = await voting.getResults(pollId);
    console.log("\n📈 Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
    return;
  }

  // Check if poll has ended
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(pollInfo[3]);
  
  if (now <= endTime) {
    console.log(`⏰ Poll is still active. Ends in ${endTime - now} seconds.`);
    console.log("⚠️  Cannot finalize yet. Wait until poll ends or fast-forward time in Hardhat.\n");
    return;
  }

  // Request finalization
  console.log("🔐 Requesting finalization...");
  const tx = await voting.requestFinalization(pollId);
  console.log(`  Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`  ✅ Finalization requested! (Block ${receipt.blockNumber})`);

  // Wait a bit for mock decryption
  console.log("\n⏳ Waiting for decryption (mock mode is instant)...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if finalized
  const updatedInfo = await voting.getPollInfo(pollId);
  if (updatedInfo[5]) {
    console.log("✅ Poll finalized!\n");
    
    // Get results
    const results = await voting.getResults(pollId);
    console.log("📈 Decrypted Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
  } else {
    console.log("⚠️  Decryption pending. Check back in a moment.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



 * Test script to finalize a poll and view decrypted results
 * Usage: npx hardhat run scripts/test-decryption.ts --network localhost
 */

import { ethers } from "hardhat";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  
  console.log(`\n🔍 Testing decryption for Poll #${pollId}...\n`);

  // Get contract
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  // Get poll info
  const pollInfo = await voting.getPollInfo(pollId);
  console.log("📊 Poll Info:");
  console.log(`  Title: ${pollInfo[0]}`);
  console.log(`  Options: ${pollInfo[1].join(", ")}`);
  console.log(`  Start: ${new Date(Number(pollInfo[2]) * 1000).toLocaleString()}`);
  console.log(`  End: ${new Date(Number(pollInfo[3]) * 1000).toLocaleString()}`);
  console.log(`  Finalized: ${pollInfo[5]}`);
  console.log(`  Total Voters: ${pollInfo[7]}`);
  console.log();

  // Check if already finalized
  if (pollInfo[5]) {
    console.log("✅ Poll already finalized!");
    const results = await voting.getResults(pollId);
    console.log("\n📈 Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
    return;
  }

  // Check if poll has ended
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(pollInfo[3]);
  
  if (now <= endTime) {
    console.log(`⏰ Poll is still active. Ends in ${endTime - now} seconds.`);
    console.log("⚠️  Cannot finalize yet. Wait until poll ends or fast-forward time in Hardhat.\n");
    return;
  }

  // Request finalization
  console.log("🔐 Requesting finalization...");
  const tx = await voting.requestFinalization(pollId);
  console.log(`  Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`  ✅ Finalization requested! (Block ${receipt.blockNumber})`);

  // Wait a bit for mock decryption
  console.log("\n⏳ Waiting for decryption (mock mode is instant)...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if finalized
  const updatedInfo = await voting.getPollInfo(pollId);
  if (updatedInfo[5]) {
    console.log("✅ Poll finalized!\n");
    
    // Get results
    const results = await voting.getResults(pollId);
    console.log("📈 Decrypted Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
  } else {
    console.log("⚠️  Decryption pending. Check back in a moment.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


