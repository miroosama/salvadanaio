// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Salvadanaio, IAavePool} from "../src/Salvadanaio.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

// ── Test doubles ──
// Faithful enough for CAP unit tests; real Aave behaviour (rates, supply caps,
// pause/freeze) is covered separately by fork tests before deploy.

/// @dev Mock interest-bearing aToken: ERC20 with open mint/burn, 6 decimals.
contract MockAToken is ERC20 {
    constructor() ERC20("Mock aUSDC", "aUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/// @dev Minimal Aave V3 pool: supply pulls the asset and mints aToken 1:1;
///      withdraw burns aToken and returns the asset.
contract MockAavePool is IAavePool {
    MockAToken public immutable aToken;

    constructor(MockAToken _aToken) {
        aToken = _aToken;
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        aToken.burn(msg.sender, amount);
        IERC20(asset).transfer(to, amount);
        return amount;
    }
}

contract DepositCapTest is Test {
    MockUSDC usdc;
    MockAToken aToken;
    MockAavePool pool;
    Salvadanaio vault;

    address alice = address(0xA11CE);
    uint256 constant CAP = 10_000e6; // $10k

    function setUp() public {
        usdc = new MockUSDC();
        aToken = new MockAToken();
        pool = new MockAavePool(aToken);
        // deployer (this test contract) is the owner via Ownable(msg.sender)
        vault = new Salvadanaio(
            IERC20(address(usdc)),
            IAavePool(address(pool)),
            IERC20(address(aToken)),
            CAP
        );

        usdc.mint(alice, 1_000_000e6);
        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
    }

    function _deposit(address who, uint256 amount) internal {
        vm.prank(who);
        vault.deposit(amount, who);
    }

    function test_maxDeposit_tracksRemainingCapacity() public {
        assertEq(vault.maxDeposit(alice), CAP, "starts at full cap");
        _deposit(alice, 4_000e6);
        assertEq(vault.totalAssets(), 4_000e6);
        assertEq(vault.maxDeposit(alice), CAP - 4_000e6, "cap minus what's in");
    }

    function test_depositUpToCap_thenReverts() public {
        _deposit(alice, CAP); // exactly the cap succeeds
        assertEq(vault.totalAssets(), CAP);
        assertEq(vault.maxDeposit(alice), 0, "no room left");

        vm.prank(alice);
        vm.expectRevert(); // ERC4626ExceededMaxDeposit
        vault.deposit(1, alice);
    }

    /// THE invariant: exits are never capped, even with the global cap full.
    function test_exitsNeverCapped_whenCapFull() public {
        _deposit(alice, CAP);
        assertEq(vault.maxDeposit(alice), 0, "cap is full");

        uint256 shares = vault.balanceOf(alice);
        assertEq(vault.maxRedeem(alice), shares, "redeem not capped");
        assertEq(vault.maxWithdraw(alice), vault.convertToAssets(shares), "withdraw not capped");
        assertGt(vault.maxWithdraw(alice), 0, "exit available");

        // and a real full exit actually goes through at the cap
        vm.prank(alice);
        vault.redeem(shares, alice, alice);
        assertEq(vault.balanceOf(alice), 0, "position cleared");
    }

    function test_setDepositCap_raiseOnly() public {
        vault.setDepositCap(20_000e6);
        assertEq(vault.depositCap(), 20_000e6, "raised");

        vm.expectRevert(bytes("cap can only be raised"));
        vault.setDepositCap(19_999e6);
    }

    function test_setDepositCap_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        vault.setDepositCap(20_000e6);
    }
}
