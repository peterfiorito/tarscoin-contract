import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumberish, ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin, TARSCoin__factory } from "../typechain";

describe("TARSCoin - Transfers", function () {
  let TARSCoin: TARSCoin__factory;
  let tarsCoin: TARSCoin;
  let owner: Signer;
  let recipient: Signer;
  let anotherAccount: Signer;
  let initialSupply: BigNumberish;

  beforeEach(async function () {
    [owner, recipient, anotherAccount] = await ethers.getSigners();
    TARSCoin = await ethers.getContractFactory("TARSCoin");
    initialSupply = ethersUtils.parseUnits("10000", 18);
    tarsCoin = await TARSCoin.deploy(initialSupply);
  });

  it("should enforce a 1-day hold period before allowing transfers", async function () {
    // Assuming the owner has all the tokens initially
    const transferAmount = ethersUtils.parseUnits("1000", 18);
    const recipientAddress = await recipient.getAddress();
    const ownerAddress = await owner.getAddress();

    // Enable trading
    await tarsCoin.openTrading();

    // Owner tries to transfer tokens to recipient before the hold period
    await expect(
        tarsCoin.transfer(recipientAddress, transferAmount),
        ).to.be.revertedWith("TARSCoin: transfer not allowed yet");

    // Advance time by 1 day on the blockchain
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Now the transfer should succeed
    await expect(tarsCoin.transfer(recipientAddress, transferAmount))
      .to.emit(tarsCoin, "Transfer")
      .withArgs(ownerAddress, recipientAddress, transferAmount);

    const expectedBalance = BigInt(initialSupply) - BigInt(transferAmount);
    // Check balances
    expect(await tarsCoin.balanceOf(ownerAddress)).to.equal(expectedBalance);
    expect(await tarsCoin.balanceOf(recipientAddress)).to.equal(transferAmount);
  });

  it("should update the last received time for non-zero recipient addresses", async function () {
    const transferAmount = ethersUtils.parseUnits("1000", 18);
    const recipientAddress = await recipient.getAddress();
    const anotherAccountAddress = await anotherAccount.getAddress();

    // Enable trading
    await tarsCoin.openTrading();
    await tarsCoin.mint(recipientAddress, transferAmount);
    
    const lastReceivedTime = await tarsCoin.getLastReceivedTime(recipientAddress);
    expect(lastReceivedTime).to.be.gt(0); // Greater than 0, indicating it's set
    
    // Advance the blockchain time to just before the hold period ends
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 - 5]);
    await ethers.provider.send("evm_mine");

    await expect(
      tarsCoin
        .connect(recipient)
        .transfer(anotherAccountAddress, transferAmount),
    ).to.be.revertedWith("TARSCoin: transfer not allowed yet");

    // After hold period, should succeed
    await ethers.provider.send("evm_increaseTime",  [24 * 60 * 60]); // Completing the hold period
    await ethers.provider.send("evm_mine");

    await expect(
      tarsCoin
        .connect(recipient)
        .transfer(anotherAccountAddress, transferAmount),
    )
      .to.emit(tarsCoin, "Transfer")
      .withArgs(recipientAddress, anotherAccountAddress, transferAmount);
  });
});
