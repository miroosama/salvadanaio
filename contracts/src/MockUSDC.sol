// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mintable test USDC for Base Sepolia.
 *         Anyone can mint — it's a testnet, no restrictions needed.
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin (Test)", "USDC") {}

    /// @notice USDC uses 6 decimals, not 18
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint test tokens to your wallet. Call with amount in raw units.
    ///         e.g. 1000 USDC = 1000000000 (1000 * 10^6)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Convenience: mint to yourself
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
