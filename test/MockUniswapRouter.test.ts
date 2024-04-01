import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as ethersUtils, Signer } from "ethers";
import { TARSCoin, MockUniswapRouter } from "../typechain";

describe("MockUniswapRouter", function () {
  let mockUniswapRouter: MockUniswapRouter;
  let token: TARSCoin;
  let owner: Signer;
  const amountTokenDesired = ethersUtils.parseEther("1");
  const amountETHMin = ethersUtils.parseEther("1");
  const amountTokenMin = ethersUtils.parseEther("1");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const MockUniswapRouter =
      await ethers.getContractFactory("MockUniswapRouter");
    mockUniswapRouter = await MockUniswapRouter.deploy();
    // Assume Token is a deployed contract compatible with IERC20
    const TARSCoinFactory = await ethers.getContractFactory("TARSCoin");
    token = await TARSCoinFactory.deploy(ethersUtils.parseUnits("1000000", 18));
  });

  it("should pass if amountTokenMin is 0,", async function () {
    // Setting amountTokenMin to 0, which is the edge case for >= 0 check
    const amountTokenMin = ethersUtils.parseEther("0");

    // Ensure the token has enough allowance
    await token
      .connect(owner)
      .approve(
        await mockUniswapRouter.getAddress(),
        amountTokenDesired.toString(),
      );

    // Call the function without expecting a revert, just to cover the branch
    await expect(
      mockUniswapRouter.addLiquidityETH(
        await token.getAddress(),
        amountTokenDesired.toString(),
        amountTokenMin.toString(),
        amountETHMin.toString(),
        await owner.getAddress(),
        deadline,
      ),
    ).not.to.be.reverted;
  });

  it("should revert if deadline is less than or equal to 0", async function () {
    await expect(
      mockUniswapRouter.addLiquidityETH(
        await token.getAddress(),
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        await owner.getAddress(),
        0, // Invalid deadline
      ),
    ).to.be.revertedWith("Deadline must be greater than zero");
  });

  it("should pass with a valid amountETHMin", async function () {
    // Approve a sufficient token amount
    await token
      .connect(owner)
      .approve(
        await mockUniswapRouter.getAddress(),
        amountTokenDesired.toString(),
      );

    // Set amountETHMin to a valid positive value
    const validAmountETHMin = ethersUtils.parseUnits("1", 18);

    await expect(
      mockUniswapRouter.addLiquidityETH(
        await token.getAddress(),
        amountTokenDesired.toString(),
        amountTokenMin.toString(),
        validAmountETHMin.toString(),
        await owner.getAddress(),
        deadline,
      ),
    ).not.to.be.reverted; // Expecting the transaction not to revert as all conditions are met
  });

  it("should revert if token allowance is insufficient", async function () {
    // First, approve an amount less than amountTokenDesired
    await token
      .connect(owner)
      .approve(
        await mockUniswapRouter.getAddress(),
        (amountTokenDesired - BigInt(1)).toString(),
      );

    await expect(
      mockUniswapRouter.addLiquidityETH(
        await token.getAddress(),
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        await owner.getAddress(),
        deadline,
      ),
    ).to.be.revertedWith("MockUniswapRouter: Insufficient token approval");
  });
});
