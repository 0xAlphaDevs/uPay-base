// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {UPayReceipt} from "../src/UPayReceipt.sol";

contract UPayReceiptTest is Test {
    UPayReceipt receipt;
    address relayer = address(0xBEEF);
    address merchant = address(0xCAFE);
    address payer = address(0xFACE);
    address usdc = address(0x1234);

    function setUp() public {
        receipt = new UPayReceipt(relayer);
    }

    function test_relayerCanRecordPayment() public {
        bytes32 sessionId = keccak256("session-1");

        vm.prank(relayer);
        vm.expectEmit(true, true, true, true);
        emit UPayReceipt.PaymentRecorded(sessionId, merchant, payer, 1_000_000, usdc, uint64(block.timestamp));
        receipt.recordPayment(sessionId, merchant, payer, 1_000_000, usdc);

        assertTrue(receipt.recorded(sessionId));
    }

    function test_revertsForNonRelayer() public {
        bytes32 sessionId = keccak256("session-2");

        vm.expectRevert(UPayReceipt.NotRelayer.selector);
        receipt.recordPayment(sessionId, merchant, payer, 1_000_000, usdc);
    }

    function test_revertsOnDoubleRecord() public {
        bytes32 sessionId = keccak256("session-3");

        vm.startPrank(relayer);
        receipt.recordPayment(sessionId, merchant, payer, 1_000_000, usdc);

        vm.expectRevert(UPayReceipt.AlreadyRecorded.selector);
        receipt.recordPayment(sessionId, merchant, payer, 1_000_000, usdc);
        vm.stopPrank();
    }
}
