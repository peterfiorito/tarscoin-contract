import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Mint", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;
  let anotherNonOwner: Signer;
  let nonOwner: Signer;

  beforeEach(async function () {
    const TARSCoin = await ethers.getContractFactory("TARSCoin");
    [owner, anotherNonOwner, nonOwner] = await ethers.getSigners();
    // Deploying the contract with an initial supply less than MAX_SUPPLY
    tarsCoin = await TARSCoin.deploy(ethersUtils.parseUnits("999900", 18)) as TARSCoin;
  });

  it("should allow minting within the max supply", async function () {
    // Minting an additional 100 tokens
    const mintAmount = BigInt(ethersUtils.parseUnits("100", 18).toString());
    await expect(tarsCoin.connect(owner).mint(owner.getAddress(), mintAmount)).to.not.be.reverted;
  
    // Fetching the new total supply
    const totalSupply = BigInt((await tarsCoin.totalSupply()).toString());
    
    // The expected supply should be the initial supply plus the mintAmount
    const expectedSupply = mintAmount + BigInt(ethersUtils.parseUnits("999900", 18).toString());
    
    // Checking if the totalSupply matches the expectedSupply
    expect(totalSupply).to.equal(expectedSupply);
  });

  it("should prevent non-owners from minting tokens", async function () {
    const amountToMint = ethersUtils.parseUnits("1000", 18);
    await expect(tarsCoin.connect(anotherNonOwner).mint(await nonOwner.getAddress(), amountToMint))
      .to.be.reverted;
  });
});