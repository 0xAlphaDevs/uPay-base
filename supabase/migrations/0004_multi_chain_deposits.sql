-- UPay: multi-chain Unified Balance deposits.
-- Checkout can now pull USDC from more than one source chain to cover a single
-- payment (e.g. $1 on Base Sepolia + $3 on Ethereum Sepolia = $4 owed), which the
-- old single-value source_chain/deposit_tx_hash text columns can't represent without
-- losing the per-chain breakdown. source_deposits keeps the full structured record;
-- source_chain/deposit_tx_hash stay populated with a joined summary string so the
-- existing dashboard Payments view (which reads those two columns directly) keeps
-- working unchanged.
-- Run this once in the Supabase SQL Editor.

alter table payments add column if not exists source_deposits jsonb;
