// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUniswapV2Factory {
  function getPair(
    address tokenA,
    address tokenB
  ) external view returns (address pair);
}

interface IUniswapV2Router02 {
  function addLiquidityETH(
    address token,
    uint amountTokenDesired,
    uint amountTokenMin,
    uint amountETHMin,
    address to,
    uint deadline
  ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract TARSCoin is ERC20, Ownable, Pausable {
  mapping(address => uint256) private _lastReceivedTime;
  uint256 public constant HOLD_PERIOD = 1 days;
  bool public tradingOpen = false;
  uint256 public constant MAX_SUPPLY = 1000000 * (10 ** 18);
  address public UNISWAP_V2_ROUTER = 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD;

  constructor(
    uint256 initialSupply
  )
    ERC20("TARS", "TARS")
    Ownable(msg.sender) // Pass the deployer's address to Ownable
    Pausable() // If Pausable also requires constructor arguments, include them accordingly
  {
    require(
      initialSupply <= MAX_SUPPLY,
      "Initial supply exceeds maximum supply"
    );
    _mint(msg.sender, initialSupply);
    _lastReceivedTime[msg.sender] = block.timestamp;
  }

  // Modifiers
  function _update(address from, address to, uint256 value) internal override {
    require(tradingOpen || from == address(0), "Trading is not yet enabled.");

    // Bypass the hold period check if the operation is a burn (to == address(0))
    if (to != address(0)) {
      require(block.timestamp - _lastReceivedTime[from] >= HOLD_PERIOD, "TARSCoin: transfer not allowed yet");
    }

    super._update(from, to, value);

    // Update the last received time for non-burn operations
    if (to != address(0) && from != address(0)) {
      _lastReceivedTime[to] = block.timestamp;
    }
  }

  // Utilities
  function burn(uint256 amount) external {
    require(
      balanceOf(msg.sender) >= amount,
      "ERC20: burn amount exceeds balance"
    );
    _burn(msg.sender, amount);
  }

  function pause() external onlyOwner {
    _pause();
  }

  function unpause() external onlyOwner {
    _unpause();
  }

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }

  function renounceOwnership() public override onlyOwner {
    super.renounceOwnership();
  }

  function openTrading() public onlyOwner {
    tradingOpen = true;
  }

  receive() external payable {
    // accepts ETH
  }

  function getLastReceivedTime(address account) public view returns (uint256) {
    return _lastReceivedTime[account];
  }

  // Liquidity
  function setUniswapRouter(address routerAddress) public onlyOwner {
    UNISWAP_V2_ROUTER = routerAddress;
  }

  function addLiquidityToUniswap(
    uint256 tokenAmount,
    uint256 ethAmount
  ) public onlyOwner {
    IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);

    // Approve token transfer to cover all possible scenarios
    _approve(address(this), address(uniswapRouter), tokenAmount);

    // Add the liquidity
    uniswapRouter.addLiquidityETH{ value: ethAmount }(
      address(this),
      tokenAmount,
      0,
      0,
      owner(),
      block.timestamp
    );
  }

  function mint(address to, uint256 amount) public onlyOwner {
    require(
      totalSupply() + amount <= MAX_SUPPLY,
      "Minting would exceed max supply"
    );
    _mint(to, amount);
    _lastReceivedTime[to] = block.timestamp;
  }
}
