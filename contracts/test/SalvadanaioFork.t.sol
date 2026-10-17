// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Salvadanaio, IAavePool} from "../src/Salvadanaio.sol";

struct ReserveConfigurationMap {
    uint256 data;
}

interface IAaveConfig {
    function getConfiguration(address asset) external view returns (ReserveConfigurationMap memory);
}

/// Fork tests against LIVE Base mainnet Aave V3.
/// Run: forge test --match-contract SalvadanaioFork
contract SalvadanaioForkTest is Test {
    // Base mainnet (also the defaults in src/lib/constants.ts)
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant AAVE_POOL = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5;
    address constant AUSDC = 0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB;

    uint256 constant CAP = 10_000e6;

    Salvadanaio vault;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        vm.createSelectFork("base");
        vault = new Salvadanaio(IERC20(USDC), IAavePool(AAVE_POOL), IERC20(AUSDC), CAP);
        deal(USDC, alice, 100_000e6);
        deal(USDC, bob, 100_000e6);
    }

    function _deposit(address who, uint256 amount) internal returns (uint256 shares) {
        vm.startPrank(who);
        IERC20(USDC).approve(address(vault), amount);
        shares = vault.deposit(amount, who);
        vm.stopPrank();
    }

    // Real Aave: deposit supplies to Aave, withdraw pulls it back whole.
    function test_fork_roundTrip() public {
        uint256 amount = 1_000e6;
        uint256 balBefore = IERC20(USDC).balanceOf(alice);

        uint256 shares = _deposit(alice, amount);
        assertGt(shares, 0, "got shares");
        assertApproxEqAbs(vault.totalAssets(), amount, 5, "aUSDC ~= deposited");
        assertEq(IERC20(USDC).balanceOf(alice), balBefore - amount, "USDC left wallet");

        vm.prank(alice);
        uint256 out = vault.redeem(shares, alice, alice);
        assertApproxEqAbs(out, amount, 5, "got ~= back");
        assertApproxEqAbs(IERC20(USDC).balanceOf(alice), balBefore, 5, "whole again");
    }

    // Real Aave yield accrues over time.
    function test_fork_yieldAccrues() public {
        _deposit(alice, 5_000e6);
        uint256 before = vault.totalAssets();
        vm.warp(block.timestamp + 365 days);
        uint256 later = vault.totalAssets();
        emit log_named_uint("before", before);
        emit log_named_uint("after 1yr", later);
        assertGt(later, before, "yield accrued");
    }

    // First-depositor inflation attack: a donor inflates totalAssets to try to
    // grief a later depositor. With _decimalsOffset()=6 the victim is protected.
    function test_fork_inflationAttack_victimProtection() public {
        // isolate from the cap so the donation doesn't merely close deposits
        vault.setDepositCap(type(uint256).max);

        // attacker opens with a small (non-dust; Aave rejects 1 wei) amount
        vm.startPrank(alice);
        IERC20(USDC).approve(address(vault), type(uint256).max);
        vault.deposit(1_000, alice); // 0.001 USDC
        // donate by supplying USDC to Aave on behalf of the vault -> inflates
        // totalAssets without minting vault shares
        uint256 donation = 10_000e6;
        IERC20(USDC).approve(AAVE_POOL, donation);
        IAavePool(AAVE_POOL).supply(USDC, donation, address(vault), 0);
        vm.stopPrank();

        assertGe(vault.totalAssets(), donation, "totalAssets inflated");

        // victim deposits after the inflation
        uint256 victimDeposit = 1_000e6;
        uint256 victimShares = _deposit(bob, victimDeposit);
        uint256 recoverable = vault.previewRedeem(victimShares);

        emit log_named_uint("victim deposited", victimDeposit);
        emit log_named_uint("victim recoverable", recoverable);

        // Victim keeps essentially all of it (>99.9%) despite the donation.
        assertGt(recoverable, (victimDeposit * 999) / 1000, "victim protected from inflation grief");
    }

    // Reserve-health flags. The vault itself can only revert when Aave is
    // frozen (new supply blocked, withdraw still allowed) or paused (all
    // blocked) — graceful handling is the frontend's job, which reads these
    // same flags to avoid showing an action that will revert.
    function test_fork_reserveIsHealthy() public view {
        uint256 data = IAaveConfig(AAVE_POOL).getConfiguration(USDC).data;
        bool active = ((data >> 56) & 1) == 1;
        bool frozen = ((data >> 57) & 1) == 1;
        bool paused = ((data >> 60) & 1) == 1;
        assertTrue(active, "USDC reserve active");
        assertFalse(frozen, "USDC reserve not frozen");
        assertFalse(paused, "USDC reserve not paused");
    }
}
