import { defineChain } from "viem";
import { baseSepolia, sepolia } from "viem/chains";

// Arc Testnet — no mainnet exists yet. Arc uses USDC itself for gas (Stable Fee Design).
export const arcTestnet = defineChain({
  id: 5042002,
  caipNetworkId: "eip155:5042002",
  chainNamespace: "eip155",
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: {
      // Proxied through our own API route — rpc.testnet.arc.io answers fine
      // but sends no CORS headers, so browsers block direct client-side calls
      // to it. See app/api/rpc/arc/route.ts.
      http: [`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/rpc/arc`],
      webSocket: ["wss://rpc.testnet.arc.io"],
    },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

// Source chains a customer might already hold funds on. Unified Balance deposits
// from any of these into the pooled balance that spend() then settles to Base.
export const sourceChains = [baseSepolia, sepolia] as const;

export const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
} as const;

// Circle's official testnet USDC token contracts (developers.circle.com/stablecoins/usdc-contract-addresses),
// not the same address space as ARC_CONTRACTS.USDC above — this is the plain ERC-20 sitting in a
// customer's wallet before it's ever deposited into Unified Balance.
export const USDC_TOKEN_ADDRESSES = {
  Arc_Testnet: ARC_CONTRACTS.USDC,
  Base_Sepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  Ethereum_Sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
} as const;

// Native USDC on Base mainnet and Base Sepolia — used only by lib/receipt.ts (the UPayReceipt
// attribution log on Base), not by Unified Balance deposit/spend above.
export const BASE_USDC_TOKEN_ADDRESSES = {
  base: "0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;
