import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin } from "../typechain";

describe("TARSCoin - Burn", function () {
  let tarsCoin: TARSCoin;
  let owner: Signer;

  beforeEach(async function () {
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    [owner] = await ethers.getSigners();
    // Deploy the contract with an initial supply less than the max
    tarsCoin = (await TARSCoinFactory.deploy(
      ethersUtils.parseUnits("999900", 18)
    )) as TARSCoin;
  });

  it("should allow a user to burn their tokens", async function () {
    // Open trading before burning
    await tarsCoin.connect(owner).openTrading();

    const amountToBurn = ethersUtils.parseUnits("100", 18);
    // Mint some tokens before burning
    await tarsCoin.connect(owner).mint(owner.getAddress(), amountToBurn);

    await expect(tarsCoin.connect(owner).burn(amountToBurn)).to.not.be
      .reverted;
    // Verify the balance has been reduced by the burned amount
    const finalBalance = await tarsCoin.balanceOf(owner.getAddress());
    const expectedFinalBalance = ethersUtils.parseUnits("999900", 18); // Balance should return to initial amount after burn
    expect(finalBalance).to.equal(expectedFinalBalance);
  });

  it("should not allow a user to burn more tokens than they own", async function () {
    // Ensure trading is open to allow burning
    await tarsCoin.connect(owner).openTrading();

    // Attempt to burn more tokens than the owner has
    const excessiveBurnAmount = ethersUtils.parseUnits("1000001", 18); // More than the owner's balance
    await expect(
      tarsCoin.connect(owner).burn(excessiveBurnAmount)
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });
});
