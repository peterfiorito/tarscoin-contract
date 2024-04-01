// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapRouter {
  event DebugLog(string message, uint value);

  event AddedLiquidity(
    address token,
    uint amountTokenDesired,
    uint amountETHMin,
    address to
  );

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
    require(deadline > 0, "Deadline must be greater than zero");
    require(amountETHMin >= 0, "ETHMin must be greater or equal to zero");

    // Check the token allowance
    require(
      IERC20(token).allowance(msg.sender, address(this)) >= amountTokenDesired,
      "MockUniswapRouter: Insufficient token approval"
    );

    emit AddedLiquidity(token, amountTokenDesired, msg.value, to);
    return (amountTokenDesired, msg.value, 0);
  }
}
