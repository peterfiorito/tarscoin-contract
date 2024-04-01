import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin, MockUniswapRouter } from "../typechain";

describe("TARSCoin - Uniswap", function () {
  let tarsCoin: TARSCoin;
  let mockRouter: MockUniswapRouter;
  let owner: Signer;
  let nonOwner: Signer;

  beforeEach(async function () {
    const MockUniswapRouter = await ethers.getContractFactory("MockUniswapRouter");
    mockRouter = await MockUniswapRouter.deploy();

    [owner, nonOwner] = await ethers.getSigners();

    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    tarsCoin = await TARSCoinFactory.deploy(ethersUtils.parseUnits("1000000", 18));

    
    const btAddress = await tarsCoin.getAddress();
    // Make sure the contract is funded
    await owner.sendTransaction({
      to: btAddress,
      value: ethersUtils.parseEther("1.0"),
    });

    // Set the Uniswap router in the BUTTNCoin contract
    await tarsCoin.setUniswapRouter(mockRouter);
  });

  it("should add liquidity to Uniswap", async function () {
    const tokenAmount = ethersUtils.parseUnits("1000", 18);
    const ethAmount = ethersUtils.parseUnits("1", "ether");

    // Ensure the addLiquidityToUniswap function is adapted for ethers v6
    await expect(tarsCoin.connect(owner).addLiquidityToUniswap(tokenAmount, ethAmount))
        .to.emit(mockRouter, 'AddedLiquidity')
        .withArgs(await tarsCoin.getAddress(), tokenAmount, ethAmount, await owner.getAddress());
  });

  it("should prevent non-owners from setting the Uniswap router", async function () {
    const newRouterAddress = "0x0000000000000000000000000000000000000001";
    await expect(tarsCoin.connect(nonOwner).setUniswapRouter(newRouterAddress))
      .to.be.reverted;
  });

  it("should fail to add liquidity when the contract has insufficient ETH", async function () {
    const tokenAmount = ethersUtils.parseUnits("1000", 18);
    const ethAmount = ethersUtils.parseUnits("10", "ether"); // Amount higher than the contract balance
  
    // Attempt to add liquidity with more ETH than the contract has
    await expect(tarsCoin.connect(owner).addLiquidityToUniswap(tokenAmount, ethAmount))
      .to.be.reverted;
  });

  it("should only allow the owner to add liquidity", async function () {
    const tokenAmount = ethersUtils.parseUnits("1000", 18);
    const ethAmount = ethersUtils.parseEther("1");

    // Attempt by non-owner should fail
    await expect(
      tarsCoin.connect(nonOwner).addLiquidityToUniswap(tokenAmount, ethAmount)
    ).to.be.reverted;

    // Attempt by owner should succeed (or at least not revert for ownership reasons)
    await expect(
      tarsCoin.connect(owner).addLiquidityToUniswap(tokenAmount, ethAmount)
    ).to.not.be.revertedWith("Ownable: caller is not the owner");
  });
});