# UPayReceipt

Onchain receipt/attribution log for UPay checkouts, deployed on Base. Holds no funds and moves
none — actual USDC settlement happens off this contract via Circle Gateway's Unified Balance.
This contract exists purely so a completed checkout is independently verifiable on BaseScan
(session id, merchant, payer, amount), and so checkout volume is attributable onchain to UPay
via Base Builder Codes.

## Setup

```bash
forge install   # already run — forge-std is vendored in lib/
forge test
```

## Deploy

1. Pick a relayer address — a fresh, low-privilege wallet. Its private key goes in
   `apps/web/.env.local` as `BASE_RELAYER_PRIVATE_KEY`; it only ever calls `recordPayment()`.
2. Set env vars for this package (e.g. in a local `.env`, not committed):
   ```
   RELAYER_ADDRESS=0x...           # public address matching BASE_RELAYER_PRIVATE_KEY above
   DEPLOYER_PRIVATE_KEY=0x...      # funds the deployment, separate from the relayer key
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://mainnet.base.org
   BASESCAN_API_KEY=...           # optional, only needed for --verify
   ```
3. Deploy to Base Sepolia first:
   ```bash
   source .env
   forge script script/Deploy.s.sol:Deploy \
     --rpc-url base_sepolia \
     --private-key $DEPLOYER_PRIVATE_KEY \
     --broadcast --verify
   ```
4. Copy the deployed address into `apps/web/.env.local` as `UPAY_RECEIPT_ADDRESS_BASE_SEPOLIA`.
   Run checkouts through the demo store, confirm `PaymentRecorded` events show up on
   [Base Sepolia BaseScan](https://sepolia.basescan.org).
5. Once confident, repeat against `--rpc-url base` and set `UPAY_RECEIPT_ADDRESS_BASE` +
   `BASE_RECEIPT_NETWORK=mainnet` in `apps/web/.env.local`.

## How it's called

`apps/web/lib/receipt.ts` → `recordPaymentOnBase()`, invoked from
`apps/web/app/api/v1/sessions/[id]/complete/route.ts` right after a checkout settles via
Circle Gateway. Best-effort only — a failure here is logged and never blocks or fails the
checkout response, since settlement has already completed by the time this runs.
