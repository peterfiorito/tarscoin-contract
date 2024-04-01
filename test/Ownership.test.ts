import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Ownership", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;
  let newOwner: Signer;
  let nonOwner: Signer;

  beforeEach(async function () {
    const TARSCoin = await ethers.getContractFactory("TARSCoin");
    [owner, newOwner, nonOwner] = await ethers.getSigners();
    tarsCoin = await TARSCoin.deploy(ethersUtils.parseUnits("500000", 18)) as TARSCoin;
  });

  it("should allow the owner to transfer ownership", async function () {
    await expect(tarsCoin.connect(owner).transferOwnership(await newOwner.getAddress()))
      .to.not.be.reverted;
    expect(await tarsCoin.owner()).to.equal(await newOwner.getAddress());
  });

  it("should allow the owner to renounce ownership", async function () {
    await expect(tarsCoin.connect(owner).renounceOwnership()).to.not.be.reverted;
    expect(await tarsCoin.owner()).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should prevent non-owners from renouncing ownership", async function () {
    await expect(tarsCoin.connect(nonOwner).renounceOwnership())
      .to.be.reverted;
  });
});