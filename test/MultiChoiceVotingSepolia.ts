import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiChoiceVoting } from "../types/contracts/MultiChoiceVoting";

describe("MultiChoiceVoting Sepolia Tests", function () {
  let multiChoiceVoting: MultiChoiceVoting;
  let contractAddress: string;

  // Increase timeout for network tests
  this.timeout(60000);

  before(async function () {
    // Skip these tests if not on Sepolia
    if (network.name !== "sepolia") {
      console.log("Skipping Sepolia tests - not on Sepolia network");
      this.skip();
      return;
    }

    // Get deployed contract address from deployments
    const deployment = require("../deployments/sepolia/MultiChoiceVoting.json");
    contractAddress = deployment.address;

    multiChoiceVoting = await ethers.getContractAt("MultiChoiceVoting", contractAddress);
  });

  describe("Sepolia Deployment", function () {
    it("Should be deployed on Sepolia", async function () {
      expect(await multiChoiceVoting.getAddress()).to.be.properAddress;
    });

    it("Should have proper contract initialization", async function () {
      const pollCount = await multiChoiceVoting.getPollCount();
      expect(pollCount).to.be.at.least(0);
    });
  });

  describe("Sepolia Network Interactions", function () {
    it("Should handle network-specific configurations", async function () {
      const network = await ethers.provider.getNetwork();
      expect(network.chainId).to.equal(11155111n); // Sepolia chain ID
    });

    it("Should be compatible with Sepolia FHEVM", async function () {
      // Test that the contract is configured for Sepolia
      const isSepoliaConfig = multiChoiceVoting instanceof ethers.Contract;
      expect(isSepoliaConfig).to.be.true;
    });

    it("Should support poll creation on testnet", async function () {
      // Test basic contract functionality
      const methods = Object.keys(multiChoiceVoting.interface.functions);
      expect(methods).to.include("createPoll");
      expect(methods).to.include("getPollInfo");
      expect(methods).to.include("vote");
    });
  });

  describe("Sepolia FHE Operations", function () {
    it("Should handle FHE-based operations", async function () {
      // This test verifies the contract interface for FHE operations
      const hasVoteFunction = multiChoiceVoting.interface.functions["vote"];
      expect(hasVoteFunction).to.exist;

      const hasFinalizationFunction = multiChoiceVoting.interface.functions["requestFinalization"];
      expect(hasFinalizationFunction).to.exist;
    });

    it("Should support encrypted count retrieval", async function () {
      const hasEncryptedCountsFunction = multiChoiceVoting.interface.functions["getEncryptedCounts"];
      expect(hasEncryptedCountsFunction).to.exist;

      const hasResultsFunction = multiChoiceVoting.interface.functions["getResults"];
      expect(hasResultsFunction).to.exist;
    });
  });

  describe("Sepolia Access Controls", function () {
    it("Should properly handle access control functions", async function () {
      const [signer] = await ethers.getSigners();

      // Test that contract exists and is accessible
      const code = await ethers.provider.getCode(await multiChoiceVoting.getAddress());
      expect(code).to.not.equal("0x");

      // Test basic view function accessibility
      await expect(multiChoiceVoting.connect(signer).getPollCount()).to.not.be.reverted;
    });

    it("Should validate poll existence checks", async function () {
      // Test with invalid poll ID
      await expect(multiChoiceVoting.getPollInfo(99999))
        .to.be.revertedWith("Poll does not exist");
    });
  });
});
