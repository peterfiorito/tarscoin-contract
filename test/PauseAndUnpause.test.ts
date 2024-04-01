import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Pause & Unpause", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;

  beforeEach(async function () {
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    [owner] = await ethers.getSigners();
    tarsCoin = await TARSCoinFactory.deploy(ethersUtils.parseUnits("1000000", 18)) as TARSCoin;
  });

  it("should allow only the owner to pause and unpause", async function () {
    await expect(tarsCoin.connect(owner).pause()).to.not.be.reverted;
    expect(await tarsCoin.paused()).to.equal(true);
  
    await expect(tarsCoin.connect(owner).unpause()).to.not.be.reverted;
    expect(await tarsCoin.paused()).to.equal(false);
  });

  it("should not allow non-owners to pause or unpause", async function () {
    const nonOwner = (await ethers.getSigners())[1]; // Getting a second account as non-owner
    await expect(tarsCoin.connect(nonOwner).pause()).to.be.reverted; // Expect this to be reverted
    await expect(tarsCoin.connect(nonOwner).unpause()).to.be.reverted; // Expect this to be reverted
  });

  it("should revert transactions when paused", async function () {
    await tarsCoin.connect(owner).pause(); // Pause the contract as the owner
    await expect(tarsCoin.connect(owner).transfer((await ethers.getSigners())[1].getAddress(), 100))
      .to.be.reverted; // Expect this transfer to fail because the contract is paused
  });
});