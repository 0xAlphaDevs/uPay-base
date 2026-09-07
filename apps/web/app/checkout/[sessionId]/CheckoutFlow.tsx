"use client";

import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  blockchainToChainId,
  buildAdapter,
  chainReservedMicros,
  depositAmountFor,
  fromUsdcMicros,
  getAppKit,
  getUsdcBalancesByChain,
  planUsdcAllocations,
  toUsdcMicros,
  type ChainAllocation,
  type ChainUsdcBalance,
  type UnifiedBalanceChainName,
} from "@/lib/appkit";

type Status =
  | "connect"
  | "loading-balances"
  | "insufficient-funds"
  | "ready"
  | "depositing"
  | "spending"
  | "completing"
  | "success"
  | "error";

interface DepositInfo {
  txHash: string;
  explorerUrl?: string;
  /** Cumulative amount actually deposited into Gateway for this chain so far (decimal string, micro-precise). */
  amount: string;
}

const CHAIN_LABELS: Record<UnifiedBalanceChainName, string> = {
  Arc_Testnet: "Arc Testnet",
  Base_Sepolia: "Base Sepolia",
  Ethereum_Sepolia: "Ethereum Sepolia",
};

export function CheckoutFlow({
  sessionId,
  amount,
  settleToken,
  recipient,
  embed = false,
}: {
  sessionId: string;
  amount: number;
  settleToken: "USDC" | "EURC";
  recipient: string;
  embed?: boolean;
}) {
  const { address, chainId, connector, isConnected } = useAccount();
  const { open } = useAppKit();
  const { switchChainAsync } = useSwitchChain();

  const [status, setStatus] = useState<Status>("connect");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [balances, setBalances] = useState<ChainUsdcBalance[] | null>(null);
  const [plan, setPlan] = useState<ChainAllocation[] | null>(null);
  const [deposits, setDeposits] = useState<Partial<Record<UnifiedBalanceChainName, DepositInfo>>>({});
  const [depositingChain, setDepositingChain] = useState<UnifiedBalanceChainName | null>(null);
  const [receipt, setReceipt] = useState<{ spendTxHash: string; explorerUrl?: string } | null>(null);

  const settlementSupported = settleToken === "USDC";

  // Runs once per wallet connect (not on every render during payment execution,
  // since it only depends on address/isConnected) — reads the wallet's raw USDC
  // balance across all supported chains regardless of which one it's currently
  // switched to, and works out automatically which chain(s) to draw from.
  useEffect(() => {
    if (!isConnected || !address || !settlementSupported) {
      setStatus("connect");
      return;
    }
    let cancelled = false;
    setStatus("loading-balances");
    getUsdcBalancesByChain(address).then((result) => {
      if (cancelled) return;
      setBalances(result);
      const nextPlan = planUsdcAllocations(result, String(amount));
      if (!nextPlan) {
        setStatus("insufficient-funds");
      } else {
        setPlan(nextPlan);
        setStatus("ready");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isConnected, address, amount, settlementSupported]);

  async function handlePay() {
    if (!connector || !address || !plan || !settlementSupported) return;
    setErrorMessage(null);

    try {
      const kit = getAppKit();

      // Chains already deposited from a previous attempt only skip re-depositing if what's
      // already there covers what THIS plan needs from them — a retry recomputes
      // planUsdcAllocations() fresh, and a changed wallet balance (e.g. after an earlier
      // partial spend) can make a later plan need more from a chain than an earlier attempt
      // deposited into it. Comparing amounts (not just "was this chain touched before")
      // tops up the difference instead of silently under-depositing and failing at spend()
      // with a Gateway "insufficient balance" error that doesn't even name the right chain.
      const completedDeposits = { ...deposits };
      // Tracked locally rather than read from the `chainId` closure value, since that
      // snapshot doesn't update mid-function as switchChainAsync() resolves across loop
      // iterations.
      let activeChainId = chainId;
      setStatus("depositing");
      for (const allocation of plan) {
        const alreadyDeposited = completedDeposits[allocation.chain];
        const alreadyMicros = alreadyDeposited ? toUsdcMicros(alreadyDeposited.amount) : 0n;
        const neededMicros = toUsdcMicros(depositAmountFor(allocation));
        if (alreadyMicros >= neededMicros) continue;
        const topUpAmount = fromUsdcMicros(neededMicros - alreadyMicros);

        setDepositingChain(allocation.chain);

        // Explicitly switch the wallet's active network before each deposit, rather than
        // relying solely on Circle's adapter to do it internally — that internal switch
        // raced against the deposit's own on-chain call in testing (deposit fired while
        // MetaMask's active chain hadn't actually finished updating yet), which viem's
        // ChainMismatchError guard then rejected. Switching first and awaiting it here
        // guarantees the wallet is actually on the target chain before we touch the SDK.
        const targetChainId = blockchainToChainId(allocation.chain);
        if (activeChainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
          activeChainId = targetChainId;
        }

        // Rebuilt after every switch (not reused across chains) so the adapter's
        // internal wallet-client cache can't be holding on to the pre-switch chain.
        const adapter = await buildAdapter(connector);
        const depositResult = await kit.unifiedBalance.deposit({
          from: { adapter, chain: allocation.chain },
          amount: topUpAmount,
          token: settleToken,
        });
        completedDeposits[allocation.chain] = {
          txHash: depositResult.txHash,
          explorerUrl: depositResult.explorerUrl,
          amount: fromUsdcMicros(alreadyMicros + toUsdcMicros(topUpAmount)),
        };
        setDeposits({ ...completedDeposits });
      }
      setDepositingChain(null);

      setStatus("spending");
      const adapter = await buildAdapter(connector);
      const spendResult = await kit.unifiedBalance.spend({
        amount: String(amount),
        token: settleToken,
        from: {
          adapter,
          allocations: plan.map(({ chain, amount: chainAmount }) => ({ chain, amount: chainAmount })),
        },
        to: { adapter, chain: "Base_Sepolia", recipientAddress: recipient },
      });

      setStatus("completing");
      const sourceDeposits = plan.map(({ chain, amount: chainAmount }) => ({
        chain,
        amount: chainAmount,
        txHash: completedDeposits[chain]?.txHash,
        explorerUrl: completedDeposits[chain]?.explorerUrl,
      }));
      const completeRes = await fetch(`/api/v1/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          payer_address: address,
          deposit_tx_hash: sourceDeposits.map((d) => d.txHash).join(","),
          source_chain: sourceDeposits.map((d) => d.chain).join(" + "),
          source_token: settleToken,
          source_deposits: sourceDeposits,
          spend_tx_hash: spendResult.txHash,
        }),
      });
      if (!completeRes.ok) {
        throw new Error("Payment settled on-chain but recording it failed — contact the merchant with this tx hash.");
      }

      setReceipt({ spendTxHash: spendResult.txHash, explorerUrl: spendResult.explorerUrl });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  useEffect(() => {
    if (status === "success" && receipt && embed) {
      window.parent.postMessage(
        { type: "upay:paid", sessionId, txHash: receipt.spendTxHash, explorerUrl: receipt.explorerUrl },
        "*",
      );
    }
  }, [status, receipt, embed, sessionId]);

  if (status === "success" && receipt) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E9F6EF] text-[26px] text-[#1F9D62]">
          ✓
        </div>
        <div className="text-[16px] font-semibold text-upay-ink">Payment complete</div>
        <p className="text-[13.5px] text-[#6B6577]">
          {amount.toFixed(2)} {settleToken} settled on Base Sepolia.
        </p>
        {receipt.explorerUrl && (
          <a
            href={receipt.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-upay-blue hover:underline"
          >
            View on BaseScan ↗
          </a>
        )}
        <span className="text-[11px] font-medium text-[#B3ADBC]">Session {sessionId}</span>
      </div>
    );
  }

  const totalAvailable = balances
    ? balances.reduce((sum, b) => sum + Number(b.micros) / 1_000_000, 0)
    : null;
  const isPaying = status === "depositing" || status === "spending" || status === "completing";

  // Arc Testnet's native gas currency is USDC itself, so planUsdcAllocations() holds back a
  // margin there for the deposit transaction's own gas (see WALLET_GAS_MARGIN in lib/appkit.ts)
  // on top of the usual Gateway-fee buffer — a wallet holding a small amount on Arc can end up
  // with none of it usable. Surfaced here so that reads as "reserved for fees," not a mystery.
  const arcBalance = balances?.find((b) => b.chain === "Arc_Testnet");
  const arcDust =
    arcBalance && arcBalance.micros > 0n && arcBalance.micros <= chainReservedMicros("Arc_Testnet")
      ? fromUsdcMicros(arcBalance.micros)
      : null;

  return (
    <div className="flex flex-col gap-3">
      {!settlementSupported && (
        <div className="rounded-lg border border-[#F0C36D] bg-[#FFF8E6] px-3.5 py-3 text-[13px] text-[#8A6100]">
          This merchant settles in EURC, which Circle App Kit's Unified Balance doesn't support for cross-chain
          deposit/spend yet — only USDC. Ask the merchant to switch settlement to USDC in the meantime.
        </div>
      )}

      {status === "error" && errorMessage && (
        <div role="alert" className="rounded-lg border border-[#F5D0CC] bg-[#FDEAEA] px-3.5 py-3 text-[13px] text-[#B3261E]">
          {errorMessage}
        </div>
      )}

      {!isConnected && settlementSupported && (
        <button
          type="button"
          onClick={() => open()}
          className="w-full rounded-[11px] bg-upay-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
        >
          Connect wallet
        </button>
      )}

      {status === "loading-balances" && (
        <div className="rounded-lg border border-[#ECE8F1] bg-[#FCFBFE] px-3.5 py-3 text-[13.5px] text-[#6B6577]">
          Checking your USDC balance on Base Sepolia, Arc Testnet, and Ethereum Sepolia…
        </div>
      )}

      {arcDust && status !== "loading-balances" && status !== "connect" && (
        <div className="rounded-lg border border-[#ECE8F1] bg-[#FCFBFE] px-3.5 py-3 text-[12.5px] text-[#8B8595]">
          Your {arcDust} USDC on Arc Testnet is reserved for network fees and won't be used for this payment.
        </div>
      )}

      {status === "insufficient-funds" && balances && (
        <>
          <div className="rounded-lg border border-[#F0C36D] bg-[#FFF8E6] px-3.5 py-3 text-[13px] text-[#8A6100]">
            <p className="font-medium">
              Not enough USDC. You have {totalAvailable?.toFixed(2)} USDC across supported chains, but this
              payment needs {amount.toFixed(2)} USDC.
            </p>
            <ul className="mt-2 space-y-0.5">
              {balances.map((b) => (
                <li key={b.chain}>
                  {CHAIN_LABELS[b.chain]}: {(Number(b.micros) / 1_000_000).toFixed(2)} USDC
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => open({ view: "Account" })}
            className="w-full rounded-[11px] border border-[#E6E1EC] bg-white px-5 py-3 text-[14.5px] font-semibold text-upay-ink transition-colors hover:bg-[#F9F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
          >
            View wallet address
          </button>
        </>
      )}

      {plan && (status === "ready" || isPaying || status === "error") && (
        <div className="rounded-lg border border-[#ECE8F1] bg-[#FCFBFE] px-3.5 py-3 text-[13.5px] text-[#6B6577]">
          <p className="font-medium text-upay-ink">Paying from {plan.length > 1 ? `${plan.length} chains` : CHAIN_LABELS[plan[0].chain]}</p>
          <ul className="mt-1 space-y-0.5">
            {plan.map((allocation) => (
              <li key={allocation.chain} className="flex items-center justify-between">
                <span>
                  {CHAIN_LABELS[allocation.chain]}
                  {depositingChain === allocation.chain && " — depositing…"}
                  {status !== "ready" && status !== "error" && deposits[allocation.chain] && depositingChain !== allocation.chain && " — deposited ✓"}
                </span>
                <span className="font-mono">{allocation.amount} USDC</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan && (
        <button
          type="button"
          onClick={handlePay}
          disabled={isPaying}
          className="w-full rounded-[11px] bg-upay-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
        >
          {status === "depositing" && `Depositing${depositingChain ? ` (${CHAIN_LABELS[depositingChain]})` : ""}…`}
          {status === "spending" && "Settling to Base…"}
          {status === "completing" && "Confirming…"}
          {(status === "ready" || status === "error") && `Pay ${amount.toFixed(2)} ${settleToken}`}
        </button>
      )}

      {Object.keys(deposits).length > 0 && status === "error" && (
        <p className="text-[12px] text-[#A39DAD]">
          Some deposits already went through — retrying will pick up where it left off without depositing those
          chains again.
        </p>
      )}
    </div>
  );
}
