// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SalvadanaioTestnet
 * @notice Testnet version of Salvadanaio. Same ERC-4626 interface as the
 *         production contract, but just holds USDC directly (no Aave).
 *         The frontend code is identical — just swap the contract address
 *         when going to mainnet.
 *
 * @dev Deploy order on Base Sepolia:
 *      1. Deploy MockUSDC
 *      2. Deploy SalvadanaioTestnet(mockUsdcAddress)
 *      3. Mint yourself test USDC via MockUSDC.faucet()
 *      4. Test deposit/withdraw via the app
 */
contract SalvadanaioTestnet is ERC4626, Ownable {

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);

    constructor(
        IERC20 _usdc
    )
        ERC4626(_usdc)
        ERC20("Salvadanaio Shares", "SALVA")
        Ownable(msg.sender)
    {}

    /**
     * @notice Total assets = USDC held by this contract.
     *         On mainnet this would read aUSDC balance (with yield).
     *         On testnet it's just the raw USDC balance.
     */
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        super._deposit(caller, receiver, assets, shares);
        emit Deposited(receiver, assets, shares);
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        super._withdraw(caller, receiver, owner, assets, shares);
        emit Withdrawn(receiver, assets, shares);
    }
}
