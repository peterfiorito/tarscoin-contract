import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");

  // Deploy the contract
  const tarsCoin = await TARSCoinFactory.deploy(0);

  // Wait for the deployment to finish
  await tarsCoin.waitForDeployment();

  const TARSAddress = await tarsCoin.getAddress();

  console.log(`TARS Contract deployed at ${TARSAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

