// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Salvadanaio
 * @notice A simple savings vault that deposits USDC into Aave V3 on Base.
 *         Users deposit USDC, receive vault shares, and earn yield from Aave.
 *         Designed for Italian savers who want better returns than a conto deposito.
 *
 * @dev Extends ERC4626 for standardized vault interface.
 *      - deposit(): User deposits USDC → vault supplies to Aave
 *      - withdraw(): User burns shares → vault withdraws from Aave → returns USDC + yield
 *      - totalAssets(): Returns total USDC value including Aave yield (via aUSDC balance)
 */

// Minimal Aave V3 Pool interface - only what we need
interface IAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

contract Salvadanaio is ERC4626, Ownable {
    using SafeERC20 for IERC20;

    IAavePool public immutable aavePool;
    IERC20 public immutable aUsdc; // Aave's aUSDC token (interest-bearing)

    // Alpha blast-radius cap on totalAssets (raise-only). Enforced via maxDeposit.
    uint256 public depositCap;

    // Events for frontend tracking
    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event DepositCapRaised(uint256 oldCap, uint256 newCap);

    constructor(
        IERC20 _usdc,
        IAavePool _aavePool,
        IERC20 _aUsdc,
        uint256 _depositCap
    )
        ERC4626(_usdc)
        ERC20("Salvadanaio Shares", "SALVA")
        Ownable(msg.sender)
    {
        aavePool = _aavePool;
        aUsdc = _aUsdc;
        depositCap = _depositCap;
    }

    /**
     * @notice Total assets managed by this vault = our aUSDC balance
     *         aUSDC is 1:1 with USDC + accrued interest, so this
     *         automatically reflects yield earned from Aave.
     */
    function totalAssets() public view override returns (uint256) {
        return aUsdc.balanceOf(address(this));
    }

    /**
     * @notice Alpha blast-radius cap, expressed through maxDeposit/maxMint so
     *         ERC4626 enforces it and integrators can read remaining capacity.
     *         Caps totalAssets (v1 simple). Exits are NEVER capped — maxWithdraw
     *         and maxRedeem keep the ERC4626 defaults.
     */
    function maxDeposit(address) public view override returns (uint256) {
        uint256 assets = totalAssets();
        return assets >= depositCap ? 0 : depositCap - assets;
    }

    function maxMint(address receiver) public view override returns (uint256) {
        return convertToShares(maxDeposit(receiver));
    }

    /**
     * @dev After ERC4626 mints shares, supply the USDC to Aave.
     */
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        // Pull USDC from user (handled by ERC4626 parent)
        super._deposit(caller, receiver, assets, shares);

        // Approve and supply USDC to Aave V3
        IERC20(asset()).approve(address(aavePool), assets);
        aavePool.supply(asset(), assets, address(this), 0);

        emit Deposited(receiver, assets, shares);
    }

    /**
     * @dev Before ERC4626 transfers USDC to user, withdraw from Aave.
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        // Withdraw USDC from Aave back to this contract
        aavePool.withdraw(asset(), assets, address(this));

        // Transfer USDC to user (handled by ERC4626 parent)
        super._withdraw(caller, receiver, owner, assets, shares);

        emit Withdrawn(receiver, assets, shares);
    }

    /**
     * @notice Emergency function to recover tokens sent by mistake.
     *         Cannot withdraw the underlying aUSDC (user funds).
     */
    function recoverToken(IERC20 token) external onlyOwner {
        require(address(token) != address(aUsdc), "Cannot withdraw aUSDC");
        token.safeTransfer(owner(), token.balanceOf(address(this)));
    }

    /**
     * @notice Raise the deposit cap. Raise-only by design — the owner can widen
     *         access as confidence grows but can never restrict it or gate exits.
     *         Worst-case key compromise is "cap got raised", not funds lost.
     */
    function setDepositCap(uint256 newCap) external onlyOwner {
        require(newCap >= depositCap, "cap can only be raised");
        emit DepositCapRaised(depositCap, newCap);
        depositCap = newCap;
    }
}
