# upay-base-sdk

The universal payment button, for humans and agents. Customers pay in USDC (or
EURC, per your dashboard settings) from any supported chain, the SDK's checkout
flow handles Circle Unified Balance deposits and settlement to your Base Sepolia
address, no bridging or network-switching UI for you to build.

```tsx
import { UPayButton } from "upay-base-sdk";

<UPayButton apiKey="pk_test_..." amount={3} />;
```

That's the whole integration: a publishable API key and an amount. Clicking the
button creates a checkout session and opens it in an embedded modal, the customer
never leaves your page.

## Install

```bash
npm install upay-base-sdk
```

```bash
pnpm add upay-base-sdk
```

`react` and `react-dom` (>=18) are peer dependencies, the SDK doesn't bundle its
own copy, so checkout modals share your app's existing React instance.

## `<UPayButton />`

```tsx
<UPayButton apiKey="pk_test_..." amount={3} />
```

Renders a "Pay with UPay" button. On click it creates a checkout session against
your `checkoutUrl` and opens it as an in-page modal (an iframe, not a new tab) so
customers connect their wallet and pay without leaving your site.

| Prop          | Type                                        | Required | Description                                                                                                                                            |
| ------------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiKey`      | `string`                                    | yes      | Your publishable key (`pk_test_...` / `pk_live_...`). Session creation only — never use a secret key (`sk_...`) here, it would be exposed client-side. |
| `amount`      | `number`                                    | yes      | Amount to charge, in the settlement token's units (e.g. `3` = 3 USDC).                                                                                 |
| `settle`      | `{ token: "USDC" \| "EURC", chain: "base" }` | no       | Forces a settlement token for this button, overriding your dashboard's default. Omit it to just use whatever's set in Settings.                        |
| `metadata`    | `Record<string, unknown>`                   | no       | Arbitrary data attached to the session (order id, cart contents, etc).                                                                                 |
| `checkoutUrl` | `string`                                    | no       | Base URL of the hosted checkout app. Defaults to the UPay-hosted checkout.                                                                             |
| `onPaid`      | `(payment: { txHash: string }) => void`     | no       | Called once the customer's payment lands on-chain.                                                                                                     |
| `onError`     | `(err: Error) => void`                      | no       | Called if session creation fails (network error, invalid key, etc).                                                                                    |
| `children`    | `ReactNode`                                 | no       | Custom button label/content. Defaults to "Pay with UPay".                                                                                              |

## `UPay` client

For non-React integrations, or server-side session creation followed by a redirect
(the Stripe Checkout-style pattern):

```ts
import { UPay } from "upay-base-sdk";

const upay = new UPay({ apiKey: "sk_..." });

const session = await upay.createCheckout({ amount: 3 });
// session.id, session.checkoutUrl

// Client-side (e.g. a plain onclick handler, no React):
upay.openCheckout(session.id); // opens the full checkout page in a new tab

// Server-side (e.g. an API route that redirects the customer):
// redirect(session.checkoutUrl)
```

`createCheckout` accepts the same `amount` / `settle` / `metadata` options as
`UPayButton`. `openCheckout` is browser-only and opens the full-page checkout
(not the embedded modal) — use it when you're not rendering `<UPayButton />`
directly, e.g. a custom button with your own click handler.

## How payment works

1. Your app creates a checkout session (via the button or `UPay.createCheckout`).
2. The customer connects a wallet inside the checkout UI.
3. The SDK reads the customer's USDC balance across supported source chains and
   deposits into Circle's Unified Balance from whichever chain(s) cover the
   amount (splitting across chains automatically if needed).
4. Funds are spent to your settlement address on Base Sepolia.
5. `onPaid` fires with the settlement transaction hash, and the checkout modal
   shows a receipt with a BaseScan link.

## Notes

- **Never expose a secret key (`sk_...`) in client-side code.** `UPayButton`
  only needs a publishable key.
- The embedded checkout modal validates the origin of messages it receives
  before trusting them, don't proxy or reverse-tunnel `checkoutUrl` behind a
  different origin than what the checkout app actually serves from.
- This SDK currently targets **testnet only** — settlement lands on Base Sepolia;
  Arc Testnet and Ethereum Sepolia are also supported as pay-in source chains.
  Don't send real funds.
