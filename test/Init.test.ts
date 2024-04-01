import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Initial Setup", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;

  beforeEach(async function () {
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    [owner] = await ethers.getSigners();
    tarsCoin = await TARSCoinFactory.deploy(ethersUtils.parseUnits("1000000", 18)) as TARSCoin;
  });

  it("should have the correct decimals set", async function () {
    expect(await tarsCoin.decimals()).to.equal(18);
  });

  it("should deploy with the correct initial supply", async function () {
    expect(await tarsCoin.totalSupply()).to.equal(ethersUtils.parseUnits("1000000", 18));
  });

  it("initial supply should not exceed the maximum supply", async function () {
    const maxSupply = await tarsCoin.MAX_SUPPLY();
    const totalSupply = await tarsCoin.totalSupply();
    expect(totalSupply).to.be.lte(maxSupply);
  });

  it("should error out if trying to mint more than MAX_SUPPLY", async function () {
    const maxSupply = await tarsCoin.MAX_SUPPLY();
    const amountToMint = ethersUtils.parseUnits("1", 18);
    const totalSupply = await tarsCoin.totalSupply();

    const excessiveAmount = (maxSupply - totalSupply) + amountToMint;

    // Attempt to mint more than the max supply
    await expect(tarsCoin.mint(await owner.getAddress(), excessiveAmount))
      .to.be.revertedWith("Minting would exceed max supply");
  });
});
