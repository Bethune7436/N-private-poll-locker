/**
 * Manually finalize a poll in mock mode
 * Usage: POLL_ID=0 npx hardhat run scripts/finalize-poll.ts --network localhost
 */

import { ethers } from "hardhat";
import { createInstance } from "@fhevm/mock-utils";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  
  console.log(`\n🔐 Finalizing Poll #${pollId}...\n`);

  // Get contract
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  // Get poll info
  const pollInfo = await voting.getPollInfo(pollId);
  console.log("📊 Poll Info:");
  console.log(`  Title: ${pollInfo[0]}`);
  console.log(`  Options: ${pollInfo[1].join(", ")}`);
  console.log(`  Finalized: ${pollInfo[5]}`);
  console.log(`  Decryption Pending: ${pollInfo[6]}`);
  console.log(`  Total Voters: ${pollInfo[7]}`);
  console.log();

  // Check status
  if (pollInfo[5]) {
    console.log("✅ Poll already finalized!");
    const results = await voting.getResults(pollId);
    console.log("\n📈 Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
    return;
  }

  if (!pollInfo[6]) {
    console.log("⚠️  No decryption pending. Please call requestFinalization first.");
    console.log("Requesting finalization now...");
    
    const tx = await voting.requestFinalization(pollId);
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("  ✅ Finalization requested!");
  }

  // Get the encrypted counts
  console.log("\n🔓 Decrypting vote counts...");
  const { MockFhevmInstance } = await import("@fhevm/mock-utils");
  const provider = ethers.provider;
  const fhevm = await MockFhevmInstance.create(provider, provider, {
    chainId: 31337,
    gatewayChainId: 55815,
    aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
    inputVerifierContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
    verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
  });

  // Get encrypted counts
  const encryptedCounts = await voting.getEncryptedCounts(pollId);
  console.log(`  Found ${encryptedCounts.length} encrypted counts`);

  // Decrypt each count
  const decryptedCounts: number[] = [];
  for (let i = 0; i < encryptedCounts.length; i++) {
    const decrypted = await fhevm.decrypt(contractAddress, encryptedCounts[i]);
    decryptedCounts.push(Number(decrypted));
    console.log(`  Option ${i}: ${decrypted} votes`);
  }

  // Manually call the decryption callback
  console.log("\n📞 Calling decryption callback...");
  const [signer] = await ethers.getSigners();
  
  // Encode the decrypted results
  const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint32[]"],
    [decryptedCounts]
  );

  // Get the poll's request ID
  const requestId = await voting.getRequestId(pollId);
  console.log(`  Request ID: ${requestId}`);

  // Call the callback
  const callbackTx = await voting.connect(signer).decryptionCallback(
    requestId,
    cleartexts,
    [] // Empty signatures for mock mode
  );
  
  console.log(`  Transaction hash: ${callbackTx.hash}`);
  await callbackTx.wait();
  console.log("  ✅ Callback executed!");

  // Verify finalization
  const updatedInfo = await voting.getPollInfo(pollId);
  if (updatedInfo[5]) {
    console.log("\n✅ Poll finalized successfully!\n");
    
    const results = await voting.getResults(pollId);
    console.log("📈 Final Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
  } else {
    console.log("\n⚠️  Finalization failed. Please check the logs.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


 * Usage: POLL_ID=0 npx hardhat run scripts/finalize-poll.ts --network localhost
 */

import { ethers } from "hardhat";
import { createInstance } from "@fhevm/mock-utils";

async function main() {
  const pollId = process.env.POLL_ID || "0";
  
  console.log(`\n🔐 Finalizing Poll #${pollId}...\n`);

  // Get contract
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const MultiChoiceVoting = await ethers.getContractFactory("MultiChoiceVoting");
  const voting = MultiChoiceVoting.attach(contractAddress);

  // Get poll info
  const pollInfo = await voting.getPollInfo(pollId);
  console.log("📊 Poll Info:");
  console.log(`  Title: ${pollInfo[0]}`);
  console.log(`  Options: ${pollInfo[1].join(", ")}`);
  console.log(`  Finalized: ${pollInfo[5]}`);
  console.log(`  Decryption Pending: ${pollInfo[6]}`);
  console.log(`  Total Voters: ${pollInfo[7]}`);
  console.log();

  // Check status
  if (pollInfo[5]) {
    console.log("✅ Poll already finalized!");
    const results = await voting.getResults(pollId);
    console.log("\n📈 Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
    return;
  }

  if (!pollInfo[6]) {
    console.log("⚠️  No decryption pending. Please call requestFinalization first.");
    console.log("Requesting finalization now...");
    
    const tx = await voting.requestFinalization(pollId);
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("  ✅ Finalization requested!");
  }

  // Get the encrypted counts
  console.log("\n🔓 Decrypting vote counts...");
  const { MockFhevmInstance } = await import("@fhevm/mock-utils");
  const provider = ethers.provider;
  const fhevm = await MockFhevmInstance.create(provider, provider, {
    chainId: 31337,
    gatewayChainId: 55815,
    aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
    inputVerifierContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
    verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
  });

  // Get encrypted counts
  const encryptedCounts = await voting.getEncryptedCounts(pollId);
  console.log(`  Found ${encryptedCounts.length} encrypted counts`);

  // Decrypt each count
  const decryptedCounts: number[] = [];
  for (let i = 0; i < encryptedCounts.length; i++) {
    const decrypted = await fhevm.decrypt(contractAddress, encryptedCounts[i]);
    decryptedCounts.push(Number(decrypted));
    console.log(`  Option ${i}: ${decrypted} votes`);
  }

  // Manually call the decryption callback
  console.log("\n📞 Calling decryption callback...");
  const [signer] = await ethers.getSigners();
  
  // Encode the decrypted results
  const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint32[]"],
    [decryptedCounts]
  );

  // Get the poll's request ID
  const requestId = await voting.getRequestId(pollId);
  console.log(`  Request ID: ${requestId}`);

  // Call the callback
  const callbackTx = await voting.connect(signer).decryptionCallback(
    requestId,
    cleartexts,
    [] // Empty signatures for mock mode
  );
  
  console.log(`  Transaction hash: ${callbackTx.hash}`);
  await callbackTx.wait();
  console.log("  ✅ Callback executed!");

  // Verify finalization
  const updatedInfo = await voting.getPollInfo(pollId);
  if (updatedInfo[5]) {
    console.log("\n✅ Poll finalized successfully!\n");
    
    const results = await voting.getResults(pollId);
    console.log("📈 Final Results:");
    pollInfo[1].forEach((option: string, idx: number) => {
      console.log(`  ${option}: ${results[idx]} votes`);
    });
  } else {
    console.log("\n⚠️  Finalization failed. Please check the logs.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

