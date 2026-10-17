// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Salvadanaio, IAavePool} from "../src/Salvadanaio.sol";

/**
 * @notice Deploys the Aave-backed Salvadanaio vault. Config comes from env so
 *         the same script serves testnet staging and mainnet prod.
 *
 * Required env: USDC_ADDRESS, AAVE_POOL_ADDRESS, AUSDC_ADDRESS, DEPOSIT_CAP
 *
 * Dry-run (no broadcast, no key):
 *   forge script script/Deploy.s.sol
 * Broadcast + verify:
 *   forge script script/Deploy.s.sol --rpc-url base --broadcast --verify \
 *     --private-key $DEPLOYER_PK --etherscan-api-key $BASESCAN_KEY
 */
contract DeployScript is Script {
    function run() external returns (Salvadanaio vault) {
        address usdc = vm.envAddress("USDC_ADDRESS");
        address aavePool = vm.envAddress("AAVE_POOL_ADDRESS");
        address aUsdc = vm.envAddress("AUSDC_ADDRESS");
        uint256 cap = vm.envUint("DEPOSIT_CAP");

        vm.startBroadcast();
        vault = new Salvadanaio(IERC20(usdc), IAavePool(aavePool), IERC20(aUsdc), cap);
        vm.stopBroadcast();

        console2.log("Salvadanaio deployed:", address(vault));
        console2.log("  USDC       :", usdc);
        console2.log("  Aave Pool  :", aavePool);
        console2.log("  aUSDC      :", aUsdc);
        console2.log("  deposit cap:", cap);
    }
}
