"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { walletLoginMessage } from "@/lib/wallet-auth-message";

type Step = "connect" | "checking" | "onboarding" | "error";

export function ConnectWalletStep() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [step, setStep] = useState<Step>("connect");
  const [signature, setSignature] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (isConnected && address && !attempted) {
      setAttempted(true);
      void handleWalletConnected(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  async function handleWalletConnected(addr: string) {
    setStep("checking");
    setError(null);
    try {
      const sig = await signMessageAsync({ message: walletLoginMessage(addr) });
      setSignature(sig);

      const res = await fetch("/api/dashboard/wallet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: addr, signature: sig }),
      });
      const data = await res.json();

      if (res.ok && data.status === "ok") {
        router.push("/dashboard/api-keys");
        router.refresh();
        return;
      }
      if (data.status === "needs_onboarding") {
        setStep("onboarding");
        return;
      }
      throw new Error(data.error ?? "Couldn't verify your wallet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't verify your wallet");
      setStep("error");
    }
  }

  async function handleOnboardSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address || !signature || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, signature, name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't create your account");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    disconnect();
    setAttempted(false);
    setSignature(null);
    setError(null);
    setStep("connect");
  }

  if (step === "onboarding") {
    return (
      <form onSubmit={handleOnboardSubmit} className="flex flex-col gap-3">
        <div>
          <div className="text-[14.5px] font-semibold text-upay-ink">What&apos;s your business called?</div>
          <p className="mt-1 text-[13px] text-[#6B6577]">
            This is the name customers and your dashboard will show. You can change it later.
          </p>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pixel Threads"
          autoFocus
          className="w-full rounded-[9px] border border-[#E6E1EC] bg-white px-3.5 py-3 text-[14px] text-upay-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue"
        />
        {error && <p className="text-[13px] text-[#B3261E]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full rounded-[11px] bg-upay-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
        <button type="button" onClick={retry} className="text-[12.5px] font-medium text-[#8B8595] hover:underline">
          Use a different wallet
        </button>
      </form>
    );
  }

  if (step === "checking") {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <p className="text-[13.5px] text-[#6B6577]">Confirm the signature request in your wallet…</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-[13px] text-[#B3261E]">
          {error}
        </p>
        <button
          type="button"
          onClick={retry}
          className="w-full rounded-[11px] bg-upay-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className="w-full rounded-[11px] bg-upay-blue px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark"
    >
      Connect wallet
    </button>
  );
}
