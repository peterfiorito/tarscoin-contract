// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock Uniswap Router behaviour for testing purposes
contract MockUniswapRouter {
  event AddedLiquidity(
    address token,
    uint amountTokenDesired,
    uint amountETHMin,
    address to
  );

  address private deployer;

  constructor() {
    deployer = msg.sender; // Set the deployer as the contract deployer
  }

  function addLiquidityETH(
    address token,
    uint amountTokenDesired,
    uint amountTokenMin,
    uint amountETHMin,
    address to,
    uint deadline
  )
    external
    payable
    returns (uint amountToken, uint amountETH, uint liquidity)
  {
    require(amountTokenMin >= 0, "Amount token min must be greater than zero");
    require(amountETHMin >= 0, "ETHMin must be greater or equal to zero");
    require(deadline > 0, "Deadline must be greater than zero");

    require(
      IERC20(token).allowance(msg.sender, address(this)) >= amountTokenDesired,
      "MockUniswapRouter: Insufficient token approval"
    );

    emit AddedLiquidity(token, amountTokenDesired, msg.value, to);
    return (amountTokenDesired, msg.value, 0);
  }

  function withdrawEther(address payable recipient, uint256 amount) external {
    require(msg.sender == deployer, "Only the deployer can withdraw Ether");
    require(amount <= address(this).balance, "Insufficient balance");
    recipient.transfer(amount);
  }
}
