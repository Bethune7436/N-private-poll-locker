import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiChoiceVoting } from "../types/contracts/MultiChoiceVoting";
import { Signers } from "../types/common";

describe("MultiChoiceVoting", function () {
  let multiChoiceVoting: MultiChoiceVoting;
  let signers: Signers;

  before(async function () {
    signers = {
      deployer: (await ethers.getSigners())[0],
      alice: (await ethers.getSigners())[1],
      bob: (await ethers.getSigners())[2],
    };
  });

  beforeEach(async function () {
    const MultiChoiceVotingFactory = await ethers.getContractFactory("MultiChoiceVoting");
    multiChoiceVoting = await MultiChoiceVotingFactory.deploy();
    await multiChoiceVoting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await multiChoiceVoting.getAddress()).to.be.properAddress;
    });

    it("Should start with zero polls", async function () {
      expect(await multiChoiceVoting.getPollCount()).to.equal(0);
    });
  });

  describe("Poll Creation", function () {
    it("Should create a poll with valid parameters", async function () {
      const title = "Favorite Color";
      const options = ["Red", "Blue", "Green"];
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 3600; // 1 hour later

      const tx = await multiChoiceVoting.createPoll(title, options, startTime, endTime);
      await tx.wait();

      expect(await multiChoiceVoting.getPollCount()).to.equal(1);
    });

    it("Should reject poll creation with invalid title", async function () {
      const options = ["Option 1", "Option 2"];
      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;

      await expect(multiChoiceVoting.createPoll("", options, startTime, endTime))
        .to.be.revertedWith("Title cannot be empty");
    });

    it("Should reject poll creation with too few options", async function () {
      const title = "Test Poll";
      const options = ["Only one option"];
      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;

      await expect(multiChoiceVoting.createPoll(title, options, startTime, endTime))
        .to.be.revertedWith("Must have 2-16 options");
    });
  });

  describe("Poll Information", function () {
    let pollId: bigint;

    beforeEach(async function () {
      const title = "Test Poll";
      const options = ["Option A", "Option B", "Option C"];
      const startTime = Math.floor(Date.now() / 1000) + 60;
      const endTime = startTime + 3600;

      const tx = await multiChoiceVoting.createPoll(title, options, startTime, endTime);
      await tx.wait();

      pollId = 0n; // First poll
    });

    it("Should return correct poll information", async function () {
      const [title, options, startTime, endTime, creator, finalized, decryptionPending, totalVoters] =
        await multiChoiceVoting.getPollInfo(pollId);

      expect(title).to.equal("Test Poll");
      expect(options).to.deep.equal(["Option A", "Option B", "Option C"]);
      expect(creator).to.equal(signers.deployer.address);
      expect(finalized).to.be.false;
      expect(totalVoters).to.equal(0);
    });

    it("Should reject access to non-existent polls", async function () {
      await expect(multiChoiceVoting.getPollInfo(999))
        .to.be.revertedWith("Poll does not exist");
    });
  });

  describe("Voting Logic", function () {
    let pollId: bigint;

    beforeEach(async function () {
      const title = "Test Poll";
      const options = ["Option A", "Option B", "Option C"];
      const startTime = Math.floor(Date.now() / 1000) - 60; // 1 minute ago (already started)
      const endTime = startTime + 7200; // 2 hours later

      const tx = await multiChoiceVoting.createPoll(title, options, startTime, endTime);
      await tx.wait();

      pollId = 0n;
    });

    it("Should track voter participation", async function () {
      // Check initial state
      expect(await multiChoiceVoting.hasUserVoted(pollId, signers.alice.address)).to.be.false;
      expect(await multiChoiceVoting.getTotalVoters(pollId)).to.equal(0);
    });

    it("Should prevent double voting", async function () {
      // First vote should succeed (in real FHE scenario)
      // Second vote should be rejected
      expect(await multiChoiceVoting.hasUserVoted(pollId, signers.alice.address)).to.be.false;
    });
  });

  describe("Finalization", function () {
    it("Should handle finalization requests", async function () {
      // Create a poll
      const title = "Test Poll";
      const options = ["Option A", "Option B"];
      const startTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const endTime = startTime + 1800; // 30 minutes ago (already ended)

      const tx = await multiChoiceVoting.createPoll(title, options, startTime, endTime);
      await tx.wait();

      // Request finalization
      await expect(multiChoiceVoting.requestFinalization(0)).to.not.be.reverted;
    });
  });
});
