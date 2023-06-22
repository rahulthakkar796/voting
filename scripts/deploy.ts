import { ethers } from "hardhat";

async function main() {
  const USDT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Use the relevant USDT/ERC20 token address
  const TOKEN_FEES = ethers.utils.parseEther("5"); // Token fees in Wei(18 decimals)

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(USDT_ADDRESS, TOKEN_FEES);
  await voting.deployed();

  console.log("Voting address:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
