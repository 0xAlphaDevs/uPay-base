// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title UPayReceipt
/// @notice Append-only onchain receipt log for UPay checkouts. UPay's actual USDC settlement
/// happens off this contract entirely, via Circle Gateway's Unified Balance (deposit/spend) —
/// this contract holds no funds and moves none. It exists so that a completed checkout
/// (session id, merchant, payer, amount) is independently verifiable on Base after the fact
/// (e.g. on BaseScan), separate from Circle's own settlement transaction, and so that
/// checkout volume is attributable onchain to UPay for Base's builder attribution tooling.
contract UPayReceipt {
    event PaymentRecorded(
        bytes32 indexed sessionId,
        address indexed merchant,
        address indexed payer,
        uint256 amount,
        address token,
        uint64 timestamp
    );

    /// @notice The only address allowed to record receipts — UPay's backend relayer wallet.
    /// Immutable rather than owner-updatable: this contract has no funds and no admin surface
    /// worth protecting beyond "don't let arbitrary callers write fake receipts."
    address public immutable relayer;

    /// @notice sessionId => already recorded, guards against double-recording a retried
    /// completion call for the same checkout session.
    mapping(bytes32 => bool) public recorded;

    error NotRelayer();
    error AlreadyRecorded();

    constructor(address _relayer) {
        relayer = _relayer;
    }

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert NotRelayer();
        _;
    }

    /// @param sessionId UPay checkout session id, as bytes32 (e.g. keccak256 of the UUID string).
    /// @param merchant Merchant's payout address for this session.
    /// @param payer Address that completed the payment.
    /// @param amount Settled amount, in the token's smallest unit (USDC has 6 decimals).
    /// @param token ERC-20 address of the settlement token on the settlement chain.
    function recordPayment(bytes32 sessionId, address merchant, address payer, uint256 amount, address token)
        external
        onlyRelayer
    {
        if (recorded[sessionId]) revert AlreadyRecorded();
        recorded[sessionId] = true;
        emit PaymentRecorded(sessionId, merchant, payer, amount, token, uint64(block.timestamp));
    }
}
