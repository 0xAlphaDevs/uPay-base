import { AppKit } from "@circle-fin/app-kit";
import { Blockchain, createViemAdapterFromProvider, resolveChainIdentifier } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http, type Address, type EIP1193Provider } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import type { Connector } from "wagmi";
import { arcTestnet, USDC_TOKEN_ADDRESSES } from "./chains";

let appKit: AppKit | null = null;

/** Client-side Circle App Kit singleton. Pass a kit key via config once one exists (CIRCLE_KIT_KEY, prod-only rate limits). */
export function getAppKit() {
  if (!appKit) {
    appKit = new AppKit();
  }
  return appKit;
}

export const SUPPORTED_CHAINS = [
  Blockchain.Arc_Testnet,
  Blockchain.Base_Sepolia,
  Blockchain.Ethereum_Sepolia,
].map(resolveChainIdentifier);

/** Wraps the wallet Reown/wagmi just connected as a Circle App Kit viem adapter. */
export async function buildAdapter(connector: Connector) {
  const provider = (await connector.getProvider()) as EIP1193Provider;
  return createViemAdapterFromProvider({
    provider,
    capabilities: {
      addressContext: "user-controlled",
      supportedChains: SUPPORTED_CHAINS,
    },
  });
}

// unifiedBalance.deposit()/spend() take chain identifiers from their own
// UnifiedBalanceChain enum (in @circle-fin/unified-balance-kit, a transitive
// dep we don't import directly) — a different, nominally-distinct enum from
// adapter-viem-v2's Blockchain even though the string values are identical.
// Plain string literals matching those values satisfy its accepted type
// (`ChainDefinition | UnifiedBalanceChain | \`${UnifiedBalanceChain}\``)
// without adding that package as an explicit dependency.
export type UnifiedBalanceChainName = "Arc_Testnet" | "Base_Sepolia" | "Ethereum_Sepolia";

/** Maps the wallet's currently connected wagmi chain ID to the chain identifier unifiedBalance calls expect. */
export function chainIdToBlockchain(chainId: number): UnifiedBalanceChainName | null {
  switch (chainId) {
    case 5042002:
      return "Arc_Testnet";
    case 84532:
      return "Base_Sepolia";
    case 11155111:
      return "Ethereum_Sepolia";
    default:
      return null;
  }
}

/** Inverse of chainIdToBlockchain — the wagmi chain ID to request via useSwitchChain(). */
export function blockchainToChainId(chain: UnifiedBalanceChainName): number {
  switch (chain) {
    case "Arc_Testnet":
      return 5042002;
    case "Base_Sepolia":
      return 84532;
    case "Ethereum_Sepolia":
      return 11155111;
  }
}

const ERC20_BALANCE_OF_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const USDC_DECIMALS = 6;

// One client per chain, created eagerly at module load (cheap — transport: http() doesn't
// touch the network until a call is made) and kept as separate concretely-typed constants
// rather than one function generic over the UnifiedBalanceChainName union or a lazily
// memoized `let` with an explicit annotation: both of those force TypeScript to reconcile
// viem's built-in Base/Ethereum Chain objects (which carry OP-stack-specific tx formatters)
// against a broader declared type, which viem's own generated types treat as incompatible.
const arcClient = createPublicClient({ chain: arcTestnet, transport: http() });
const baseSepoliaClient = createPublicClient({ chain: baseSepolia, transport: http() });
const ethereumSepoliaClient = createPublicClient({ chain: sepolia, transport: http() });

function getReadOnlyClient(chain: UnifiedBalanceChainName) {
  switch (chain) {
    case "Arc_Testnet":
      return arcClient;
    case "Base_Sepolia":
      return baseSepoliaClient;
    case "Ethereum_Sepolia":
      return ethereumSepoliaClient;
  }
}

/** Converts a human-readable decimal amount (e.g. "4.5") to integer USDC micro-units, avoiding float rounding error. */
export function toUsdcMicros(amount: string): bigint {
  const [whole, frac = ""] = amount.trim().split(".");
  const paddedFrac = (frac + "0".repeat(USDC_DECIMALS)).slice(0, USDC_DECIMALS);
  return BigInt((whole || "0") + paddedFrac);
}

/** Converts integer USDC micro-units back to a human-readable decimal string, e.g. 1_500_000n -> "1.5". */
export function fromUsdcMicros(micros: bigint): string {
  const divisor = 10n ** BigInt(USDC_DECIMALS);
  const whole = micros / divisor;
  const frac = (micros % divisor).toString().padStart(USDC_DECIMALS, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

export interface ChainUsdcBalance {
  chain: UnifiedBalanceChainName;
  /** Raw wallet USDC balance on this chain, in micro-units (not yet deposited into Unified Balance). */
  micros: bigint;
}

/**
 * Reads the wallet's plain ERC-20 USDC balance on every supported chain in parallel,
 * independent of whichever network the wallet is currently switched to — this is what
 * lets the checkout flow see "$1 on Base Sepolia + $3 on Ethereum Sepolia" without the
 * user manually switching networks first. A chain whose RPC read fails is reported as
 * a zero balance rather than failing the whole lookup, since one flaky testnet RPC
 * shouldn't block a payment that another chain's balance alone could cover.
 */
const ALL_UNIFIED_BALANCE_CHAINS: UnifiedBalanceChainName[] = ["Arc_Testnet", "Base_Sepolia", "Ethereum_Sepolia"];

export async function getUsdcBalancesByChain(address: Address): Promise<ChainUsdcBalance[]> {
  const chains = ALL_UNIFIED_BALANCE_CHAINS;
  return Promise.all(
    chains.map(async (chain) => {
      try {
        const raw = await getReadOnlyClient(chain).readContract({
          address: USDC_TOKEN_ADDRESSES[chain] as Address,
          abi: ERC20_BALANCE_OF_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        return { chain, micros: raw as bigint };
      } catch {
        return { chain, micros: 0n };
      }
    }),
  );
}

export interface ChainAllocation {
  chain: UnifiedBalanceChainName;
  /** Human-readable decimal string, as deposit()/spend() expect. */
  amount: string;
}

// Mirrors GAS_FEE_BY_CHAIN in @circle-fin/provider-gateway-v1 (checked directly against the
// installed package source) — Circle's own Unified Balance auto-allocator reserves exactly
// this much per chain before treating a deposit as spendable, and Ethereum's reserve (2 USDC)
// dwarfs Arc's and Base's. A naive "largest wallet balance first" allocator has no awareness
// of this and readily picks Ethereum Sepolia for a small payment — the deposit lands fine,
// but Gateway's own spend()-time fee then exceeds the bare payment amount that was deposited,
// failing with "insufficient balance for depositor" (observed live: depositing exactly $3.00
// and paying from Ethereum Sepolia alone hit "available 3.5, required 4" — the ~$1.10
// Gateway fee on that chain wasn't covered by depositing only the payment amount).
const CHAIN_FEE_BUFFER: Record<UnifiedBalanceChainName, string> = {
  Arc_Testnet: "0.01",
  Base_Sepolia: "0.05",
  Ethereum_Sepolia: "2.5",
};

// Reserved purely so the wallet keeps enough USDC to pay for the deposit() transaction's
// own gas — separate from CHAIN_FEE_BUFFER above (which covers Gateway's *escrow-side* fee
// and does get deposited). Arc Testnet's native gas currency is USDC itself (see
// arcTestnet.nativeCurrency in lib/chains.ts, "Stable Fee Design"), so a chain whose entire
// spendable balance gets deposited — as CHAIN_FEE_BUFFER alone would allow, since that
// buffer is added back into the deposit amount by depositAmountFor() — can leave nothing in
// the wallet to actually pay for the transaction that moves it. This margin is deliberately
// never deposited: it's excluded from the allocation entirely and simply stays in the
// wallet. Zero on every other chain, where gas is a separate native token untouched by USDC
// deposits.
const WALLET_GAS_MARGIN: Record<UnifiedBalanceChainName, string> = {
  Arc_Testnet: "0.05",
  Base_Sepolia: "0",
  Ethereum_Sepolia: "0",
};

// Same three-tier ordering Circle's own computeAutoAllocation uses: settle directly on Base
// when possible (no cross-chain fee at all, since Base Sepolia is now the settlement
// destination — see CheckoutFlow.tsx), then other cheap chains, and Ethereum last since
// it's disproportionately expensive to bridge from on Gateway.
const CHAIN_PRIORITY: UnifiedBalanceChainName[] = ["Base_Sepolia", "Arc_Testnet", "Ethereum_Sepolia"];

/**
 * Allocates the required amount across chains in Circle Gateway fee-cost order (cheapest
 * first, Ethereum last), reserving each chain's CHAIN_FEE_BUFFER (deposited alongside the
 * allocation, to cover Gateway's own fee) and WALLET_GAS_MARGIN (never deposited, kept in
 * the wallet for its own transaction gas) out of its wallet balance before treating the rest
 * as spendable — this both avoids picking an expensive-to-bridge chain over a cheap one just
 * because its raw balance happens to be larger, and makes sure the reserved headroom is
 * actually available in the wallet before depositAmountFor() asks to deposit amount + buffer
 * from it. Returns null if the combined spendable USDC (after reserving each touched chain's
 * buffer and margin) falls short of what's needed.
 */
/** CHAIN_FEE_BUFFER + WALLET_GAS_MARGIN for a chain — the amount its wallet balance must
 * exceed before planUsdcAllocations() will draw from it at all. Exported so the checkout UI
 * can explain why a wallet holding some USDC on a chain (typically Arc Testnet, the only one
 * with a nonzero WALLET_GAS_MARGIN) still isn't drawing from it — dust below this reserve is
 * silently unusable rather than a funding error, and the customer shouldn't be left guessing. */
export function chainReservedMicros(chain: UnifiedBalanceChainName): bigint {
  return toUsdcMicros(CHAIN_FEE_BUFFER[chain]) + toUsdcMicros(WALLET_GAS_MARGIN[chain]);
}

export function planUsdcAllocations(balances: ChainUsdcBalance[], amountNeeded: string): ChainAllocation[] | null {
  const byChain = new Map(balances.map((b) => [b.chain, b.micros]));
  const plan: ChainAllocation[] = [];
  let remaining = toUsdcMicros(amountNeeded);

  for (const chain of CHAIN_PRIORITY) {
    if (remaining <= 0n) break;
    const micros = byChain.get(chain) ?? 0n;
    const reservedMicros = chainReservedMicros(chain);
    const spendable = micros > reservedMicros ? micros - reservedMicros : 0n;
    if (spendable <= 0n) continue;
    const take = spendable < remaining ? spendable : remaining;
    plan.push({ chain, amount: fromUsdcMicros(take) });
    remaining -= take;
  }

  return remaining > 0n ? null : plan;
}

/**
 * The amount to actually deposit for a given payment allocation — the payment portion plus
 * that chain's CHAIN_FEE_BUFFER, so the Gateway-confirmed balance spend() draws from still
 * covers the payment after Gateway's own fee is deducted. Any unused buffer isn't lost — it
 * stays as spendable Unified Balance for this depositor's next payment.
 */
export function depositAmountFor(allocation: ChainAllocation): string {
  return fromUsdcMicros(toUsdcMicros(allocation.amount) + toUsdcMicros(CHAIN_FEE_BUFFER[allocation.chain]));
}
