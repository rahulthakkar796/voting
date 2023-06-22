import { Signer } from "@ethersproject/abstract-signer";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Voting, Token } from "../typechain-types";
chai.use(solidity);
const { expect } = chai;

describe("Voting", async () => {
  let voting: Voting;
  let usdt: Token;
  let signers: Signer[];
  let usdtSupply: BigNumberish = "100000";

  const registerProject = async (name: string): Promise<void> => {
    try {
      const txn = await voting.registerProject(name);
      await txn.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const castVote = async (projectID: number): Promise<void> => {
    try {
      const txn = await voting.castVote(projectID);
      await txn.wait();
    } catch (error) {
      console.log(error);
    }
  };

  beforeEach(async () => {
    try {
      signers = await ethers.getSigners();
      const votingFactory = await ethers.getContractFactory("Voting");
      const usdtfactory = await ethers.getContractFactory("Token");
      usdt = await usdtfactory.deploy(usdtSupply, 18, "USDT", "USDT");
      await usdt.deployed();

      const TOKEN_FEES = ethers.utils.parseEther("5");
      voting = await votingFactory.deploy(usdt.address, TOKEN_FEES);
      await voting.deployed();
    } catch (err) {
      console.log("err:", err);
    }
  });

  describe("Register project", async () => {
    it("should register the project", async () => {
      const name = "Project 1";
      await registerProject(name);

      const projectDetails = await voting.projectDetails(0);
      expect(projectDetails.name).to.be.equal(
        name,
        "Project name doesn't match"
      );
    });
  });

  describe("Voting tests", async () => {
    beforeEach(async () => {
      for (let i = 0; i < 4; i++) {
        const name = `Project${i}`;
        await registerProject(name);
      }
    });

    it("should cast the free vote", async () => {
      await castVote(0);

      const details = await voting.voterDetails(await signers[0].getAddress());
      expect(details.totalVotes).to.be.equal(1, "cast vote failed");
    });

    it("should cast 3 free votes", async () => {
      for (let i = 0; i < 3; i++) {
        await castVote(i);
      }

      const details = await voting.voterDetails(await signers[0].getAddress());
      expect(details.totalVotes).to.be.equal(3, "cast vote failed");
    });

    it("should charge the fees after 3 free votes per month", async () => {
      for (let i = 0; i < 3; i++) {
        await castVote(i);
      }

      const approve = await usdt.approve(
        voting.address,
        ethers.utils.parseEther(usdtSupply.toString())
      );
      approve.wait();

      const TOKEN_FEES = await voting.TOKEN_FEES();

      await expect(voting.castVote(3)).to.changeTokenBalance(
        usdt,
        voting,
        TOKEN_FEES.toString()
      );
    });

    describe("Revert transactions tests", async () => {
      it("should revert if user has already voted for the project", async () => {
        await castVote(0);
        await expect(voting.castVote(0)).to.be.revertedWith(
          "User has already voted"
        );
      });

      it("should revert if voting for the non-existent project", async () => {
        await expect(voting.castVote(10)).to.be.revertedWith(
          "Invalid project ID"
        );
      });
    });
  });

  describe("Owner only methods", async () => {
    it("should claim fees collected by the contract", async () => {
      //Transfer USDT to voting contract to test the withdraw fees
      const TOKEN_FEES = ethers.utils.parseEther("5");
      const txn = await usdt.transfer(voting.address, TOKEN_FEES);
      await txn.wait();

      const owner = await voting.owner();
      const usdtBalance = await usdt.balanceOf(voting.address);
      await expect(voting.withdrawFees()).to.changeTokenBalance(
        usdt,
        owner,
        usdtBalance
      );
    });

    it("should change the token fees", async () => {
      const NEW_TOKEN_FEES = ethers.utils.parseEther("2.5");
      const txn = await voting.updateTokenFees(NEW_TOKEN_FEES);
      await txn.wait();

      const TOKEN_FEES = await voting.TOKEN_FEES();
      expect(NEW_TOKEN_FEES).to.be.equal(TOKEN_FEES, "Token fees don't match");
    });
  });
});
