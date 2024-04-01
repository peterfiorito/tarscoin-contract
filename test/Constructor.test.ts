import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils } from "ethers";

describe("TARSCoin - Constructor", function () {
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
  });

  it("should fail if the initial supply exceeds the maximum supply", async function () {
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");

    // Define an initial supply greater than the maximum supply
    const initialSupply = ethersUtils.parseUnits("1000001", 18); // MAX_SUPPLY is 1000000 tokens

    // Expect the contract deployment to be reverted due to exceeding the max supply
    await expect(TARSCoinFactory.deploy(initialSupply))
      .to.be.revertedWith("Initial supply exceeds maximum supply");
  });

  it("should deploy successfully if the initial supply is within the maximum supply limit", async function () {
    const BUTTNCoin = await ethers.getContractFactory("TARSCoin");

    // Define an initial supply less than or equal to the maximum supply
    const initialSupply = ethersUtils.parseUnits("1000000", 18); // MAX_SUPPLY is 1000000 tokens

    // Expect the contract to deploy successfully
    const buttnCoin = await BUTTNCoin.deploy(initialSupply);
    expect(await buttnCoin.totalSupply()).to.equal(initialSupply);
  });
});
