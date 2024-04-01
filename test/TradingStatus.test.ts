import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Trading Status", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;
  let nonOwner: Signer;

  beforeEach(async function () {
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    [owner, nonOwner] = await ethers.getSigners();
    tarsCoin = await TARSCoinFactory.deploy(ethersUtils.parseUnits("1000000", 18)) as TARSCoin;
  });

  it("should have trading disabled by default", async function () {
    expect(await tarsCoin.tradingOpen()).to.equal(false);
  });

  it("should allow only the owner to open trading", async function () {
    await expect(tarsCoin.connect(owner).openTrading()).to.not.be.reverted;
    expect(await tarsCoin.tradingOpen()).to.equal(true);
  });

  it("should not allow non-owners to open trading", async function () {
    await expect(tarsCoin.connect(nonOwner).openTrading()).to.be.reverted;
  });

  it("should not allow trading if trading is not open", async function () {
    const [_owner, receiver] = await ethers.getSigners();
    await expect(tarsCoin.transfer(receiver.getAddress(), 100)).to.be.revertedWith("Trading is not yet enabled.");
  });
});