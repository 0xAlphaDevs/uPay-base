// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {UPayReceipt} from "../src/UPayReceipt.sol";

/// Usage (Base Sepolia):
///   forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_SEPOLIA_RPC_URL \
///     --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
///
/// Usage (Base mainnet) — swap the rpc-url:
///   forge script script/Deploy.s.sol:Deploy --rpc-url $BASE_RPC_URL \
///     --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
///
/// RELAYER_ADDRESS should be the public address matching BASE_RELAYER_PRIVATE_KEY
/// in apps/web's .env.local — that's the only account allowed to call recordPayment().
contract Deploy is Script {
    function run() external returns (UPayReceipt) {
        address relayer = vm.envAddress("RELAYER_ADDRESS");

        vm.startBroadcast();
        UPayReceipt receipt = new UPayReceipt(relayer);
        vm.stopBroadcast();

        console.log("UPayReceipt deployed to:", address(receipt));
        console.log("Relayer:", relayer);
        return receipt;
    }
}
