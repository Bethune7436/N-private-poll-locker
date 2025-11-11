/**
 * Debug poll state
 * Usage: POLL_ID=0 npx hardhat run scripts/debug-poll.ts --network localhost
 */

import { ethers } from "hardhat";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  console.log(`\n🔍 Debugging Poll #${pollId}...\n`);

  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  try {
    // Get poll count
    const pollCount = await voting.getPollCount();
    console.log(`📊 Total Polls: ${pollCount}`);

    if (Number(pollCount) === 0) {
      console.log("\n⚠️  No polls exist yet. Please create a poll first.");
      return;
    }

    // Get poll info
    const pollInfo = await voting.getPollInfo(pollId);
    console.log("\n📋 Poll Info:");
    console.log(`  Title: ${pollInfo[0]}`);
    console.log(`  Options: ${pollInfo[1].join(", ")}`);
    console.log(`  Start Time: ${new Date(Number(pollInfo[2]) * 1000).toLocaleString()}`);
    console.log(`  End Time: ${new Date(Number(pollInfo[3]) * 1000).toLocaleString()}`);
    console.log(`  Creator: ${pollInfo[4]}`);
    console.log(`  Finalized: ${pollInfo[5]}`);
    console.log(`  Decryption Pending: ${pollInfo[6]}`);
    console.log(`  Total Voters: ${pollInfo[7]}`);

    // Get encrypted counts
    console.log("\n🔐 Encrypted Counts:");
    try {
      const encryptedCounts = await voting.getEncryptedCounts(pollId);
      console.log(`  Found ${encryptedCounts.length} encrypted values`);
      
      if (encryptedCounts.length === 0) {
        console.log("  ⚠️  No encrypted counts found! This might cause requestFinalization to fail.");
      } else {
        for (let i = 0; i < encryptedCounts.length; i++) {
          console.log(`  Option ${i}: ${encryptedCounts[i]}`);
        }
      }
    } catch (err) {
      console.error("  ❌ Failed to get encrypted counts:", err);
    }

    // Check if user has voted
    const [signer] = await ethers.getSigners();
    const hasVoted = await voting.hasUserVoted(pollId, signer.address);
    console.log(`\n🗳️  Has ${signer.address} voted: ${hasVoted}`);

    // Get current block timestamp
    const block = await ethers.provider.getBlock("latest");
    console.log(`\n⏰ Current Block Time: ${new Date(Number(block?.timestamp) * 1000).toLocaleString()}`);
    
    const hasEnded = block ? Number(block.timestamp) > Number(pollInfo[3]) : false;
    console.log(`  Poll has ended: ${hasEnded}`);

  } catch (err) {
    console.error("\n❌ Error:", err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



 * Debug poll state
 * Usage: POLL_ID=0 npx hardhat run scripts/debug-poll.ts --network localhost
 */

import { ethers } from "hardhat";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  console.log(`\n🔍 Debugging Poll #${pollId}...\n`);

  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  try {
    // Get poll count
    const pollCount = await voting.getPollCount();
    console.log(`📊 Total Polls: ${pollCount}`);

    if (Number(pollCount) === 0) {
      console.log("\n⚠️  No polls exist yet. Please create a poll first.");
      return;
    }

    // Get poll info
    const pollInfo = await voting.getPollInfo(pollId);
    console.log("\n📋 Poll Info:");
    console.log(`  Title: ${pollInfo[0]}`);
    console.log(`  Options: ${pollInfo[1].join(", ")}`);
    console.log(`  Start Time: ${new Date(Number(pollInfo[2]) * 1000).toLocaleString()}`);
    console.log(`  End Time: ${new Date(Number(pollInfo[3]) * 1000).toLocaleString()}`);
    console.log(`  Creator: ${pollInfo[4]}`);
    console.log(`  Finalized: ${pollInfo[5]}`);
    console.log(`  Decryption Pending: ${pollInfo[6]}`);
    console.log(`  Total Voters: ${pollInfo[7]}`);

    // Get encrypted counts
    console.log("\n🔐 Encrypted Counts:");
    try {
      const encryptedCounts = await voting.getEncryptedCounts(pollId);
      console.log(`  Found ${encryptedCounts.length} encrypted values`);
      
      if (encryptedCounts.length === 0) {
        console.log("  ⚠️  No encrypted counts found! This might cause requestFinalization to fail.");
      } else {
        for (let i = 0; i < encryptedCounts.length; i++) {
          console.log(`  Option ${i}: ${encryptedCounts[i]}`);
        }
      }
    } catch (err) {
      console.error("  ❌ Failed to get encrypted counts:", err);
    }

    // Check if user has voted
    const [signer] = await ethers.getSigners();
    const hasVoted = await voting.hasUserVoted(pollId, signer.address);
    console.log(`\n🗳️  Has ${signer.address} voted: ${hasVoted}`);

    // Get current block timestamp
    const block = await ethers.provider.getBlock("latest");
    console.log(`\n⏰ Current Block Time: ${new Date(Number(block?.timestamp) * 1000).toLocaleString()}`);
    
    const hasEnded = block ? Number(block.timestamp) > Number(pollInfo[3]) : false;
    console.log(`  Poll has ended: ${hasEnded}`);

  } catch (err) {
    console.error("\n❌ Error:", err);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


