import { createPublicClient, createWalletClient, http, keccak256, toBytes, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { BASE_USDC_TOKEN_ADDRESSES } from "./chains";

// Set once UPayReceipt is deployed (see packages/contracts). Sepolia first, mainnet once
// there's confidence in the flow — see packages/contracts/README.md for deploy steps.
const RECEIPT_CONTRACT_ADDRESS = {
  base: process.env.UPAY_RECEIPT_ADDRESS_BASE as Address | undefined,
  baseSepolia: process.env.UPAY_RECEIPT_ADDRESS_BASE_SEPOLIA as Address | undefined,
} as const;

const UPAY_RECEIPT_ABI = [
  {
    type: "function",
    name: "recordPayment",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sessionId", type: "bytes32" },
      { name: "merchant", type: "address" },
      { name: "payer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
    ],
    outputs: [],
  },
] as const;

const USDC_DECIMALS = 6;

/** UPay session ids are UUIDs (not native bytes32) — hash to a stable onchain identifier. */
export function sessionIdToBytes32(sessionId: string) {
  return keccak256(toBytes(sessionId));
}

function getNetwork() {
  // Defaults to Base Sepolia during testing; set BASE_RECEIPT_NETWORK=mainnet once the
  // contract is deployed to Base mainnet and this should point production traffic there.
  return process.env.BASE_RECEIPT_NETWORK === "mainnet"
    ? { chain: base, address: RECEIPT_CONTRACT_ADDRESS.base, usdc: BASE_USDC_TOKEN_ADDRESSES.base as Address }
    : {
        chain: baseSepolia,
        address: RECEIPT_CONTRACT_ADDRESS.baseSepolia,
        usdc: BASE_USDC_TOKEN_ADDRESSES.baseSepolia as Address,
      };
}

/**
 * Records a completed checkout on UPayReceipt (Base). Best-effort: this is an attribution/
 * audit-trail write, not part of settlement — settlement already finished via Circle Gateway
 * before this is ever called. A failure here must never fail the checkout, so callers should
 * catch and log rather than propagate. Only records USDC-settled payments — EURC checkouts
 * (settlement_token = 'EURC') have no Base USDC equivalent to log against and are skipped.
 */
export async function recordPaymentOnBase(params: {
  sessionId: string;
  merchant: Address;
  payer: Address;
  amountDecimal: string;
}) {
  const relayerKey = process.env.BASE_RELAYER_PRIVATE_KEY;
  const { chain, address, usdc } = getNetwork();
  if (!relayerKey || !address) {
    // Not configured yet (e.g. local dev, or contract not deployed) — skip quietly.
    return null;
  }

  const account = privateKeyToAccount(relayerKey as `0x${string}`);
  const walletClient = createWalletClient({ account, chain, transport: http() });
  const publicClient = createPublicClient({ chain, transport: http() });

  const amountMicros = BigInt(Math.round(Number(params.amountDecimal) * 10 ** USDC_DECIMALS));

  const hash = await walletClient.writeContract({
    address,
    abi: UPAY_RECEIPT_ABI,
    functionName: "recordPayment",
    args: [sessionIdToBytes32(params.sessionId), params.merchant, params.payer, amountMicros, usdc],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
