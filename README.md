# UPay

**The universal payment button, for humans and agents.**

## Table of Contents

- [Description](#description)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Components](#components)
- [Links](#links)
- [Future Vision](#future-vision)
- [Team](#team)

## Description

UPay is the universal payment button, for humans and agents. Accepts stablecoin payments from any chain, in a single tap, and settles in USDC on Base. Unified Balance pools the customer's stablecoin balance across every chain they hold funds on (including Arc and Ethereum) into one spendable balance, no bridging, no chain picker, no wallet-specific authorization type — then settles it to Base. The Stripe of crypto for Base, made possible by chain abstraction, and built to work headlessly for autonomous agent payers just as well as human ones.

Every completed checkout is also logged onchain on Base via [`UPayReceipt`](packages/contracts), a lightweight, funds-free attribution contract — independently verifiable on BaseScan, separate from Circle's own settlement transaction.

## Problem Statement

### 1. Fragmented Stablecoin Liquidity

Customers hold USDC scattered across a dozen chains, no single merchant integration can support them all.

### 2. Bridge Fatigue

Manually bridging, swapping, and switching networks before paying kills conversion and trust.

### 3. No Native Stablecoin Checkout

No simple, native way for merchants to accept stablecoins and settle on Base, just clunky plugins and processors built for a different chain entirely.

## Features

### 1. One-Tap Checkout

Pay with USDC from whatever chain it lives on. No bridging, no network switching, no chain selection screen, Unified Balance reads the customer's USDC balance across every supported source chain and deposits from whichever chain(s) cover the amount, splitting automatically if needed.

### 2. Drop-In Pay Button

`<UPayButton />` , a Stripe-style component a merchant embeds on any storefront in minutes, published as [`upay-base-sdk`](https://www.npmjs.com/package/upay-base-sdk) on npm. Just a publishable API key and an amount; no custom checkout flow to build.

### 3. Merchant-Defined Settlement

The merchant sets their settlement token (USDC or EURC) once, from a dashboard, and every payment lands there on Base, on-chain, automatically. Customers can still pay in from Arc, Base, or Ethereum testnets; the merchant never sees any of that.

## Components

- **UPay Button / SDK** : embeddable React component, published as [`upay-base-sdk`](https://www.npmjs.com/package/upay-base-sdk).
- **UPay Checkout** : hosted modal (embedded iframe): Reown wallet connect → deposit → spend → receipt.
- **UPay API** : checkout sessions, settlement config, API keys (Next.js API routes + Supabase).
- **Engine** : `@circle-fin/app-kit` (Unified Balance) with a viem adapter for EVM wallets, settling to Base Sepolia.
- **UPayReceipt** ([`packages/contracts`](packages/contracts)) : a relayer-gated, funds-free Solidity contract deployed on Base that logs `PaymentRecorded` for every completed checkout — onchain attribution, independent of Circle's own settlement tx.
- **Wallet layer** : Reown AppKit (`@reown/appkit` + `@reown/appkit-adapter-wagmi`), source chains include a custom Arc Testnet chain definition (chain ID `5042002`) alongside Base and Ethereum Sepolia.
- **Merchant dashboard** : payments, API keys, settlement settings, Treasury / Borrow (soon).

## Links

- Deployed URL: [upay.finance](https://www.upay.finance/)
- SDK: [upay-base-sdk](https://www.npmjs.com/package/upay-base-sdk)
- Demo Store: [demo.upay.finance](https://demo.upay.finance/)
- UPayReceipt contract (Base Sepolia): [`0x87024024a0cae5046834872B2ADEFD5468782846`](https://sepolia.basescan.org/address/0x87024024a0cae5046834872B2ADEFD5468782846)

## Future Vision

### 1. Subscriptions

Real on-chain recurring payments, no re-approval per cycle. A merchant-controlled delegate EOA signs each recurring `spend()` after a single customer authorization, Circle App Kit's own documented delegate workflow ("the wallet remains the depositor, an authorized EOA signs each spend"), not a custom auth scheme. The schema already has a `subscriptions` table and `checkout_sessions.is_subscription` waiting for this.

### 2. Agent Payments

Extend UPay to support AI agents as customers, enabling autonomous agents to subscribe to services and make programmable USDC payments while leveraging the same merchant infrastructure a human checkout uses — no browser, no wallet popup required. This is the payoff on the "for humans and agents" half of the tagline.

### 3. Treasury

Settled USDC shouldn't sit idle. Auto-sweep it into USYC, Circle's tokenized short-term Treasury fund, so merchant balances earn yield without ever leaving Base or converting to a different asset.

### 4. Borrow, against Treasury

Borrow USDC directly against your own Treasury/USYC position, not by posting ETH/BTC. Same asset class in and out: no cross-collateral risk, no unwinding a yield-bearing position just to access short-term liquidity, and no reintroducing the "any coin" problem the rest of UPay deliberately avoids.

### 5. Scale & Rails

Fiat settlement via off-ramp partners and mainnet rollout on Base once this testnet phase proves out.

### 6. NFT Receipts

`UPayReceipt` currently emits a plain `PaymentRecorded` event per checkout — cheap, and enough for onchain attribution. A future version could mint the payer a receipt NFT instead (or in addition), giving them something visible and ownable in their wallet — proof of purchase they can hold, show, or build loyalty/perks on top of — rather than just a line in an event log.

## Team

Built by **Team AlphaDevs**.
