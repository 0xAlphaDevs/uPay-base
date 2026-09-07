"use client";

import { useState } from "react";
import { TokenIcon } from "@/app/components/TokenIcon";

function CopyButton({ text, tone = "default" }: { text: string; tone?: "default" | "accent" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const toneClass =
    tone === "accent"
      ? "bg-[#EAF0FF] text-upay-bluedark hover:bg-[#DCE7FF]"
      : "border border-[#E6E1EC] bg-white text-[#1B1622] hover:bg-[#F9F7F2]";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-[7px] px-[11px] py-[6px] text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2 ${toneClass}`}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function ApiKeysView({
  settlementAddress,
  createdLabel,
  publishableKey,
}: {
  settlementAddress: string;
  createdLabel: string;
  publishableKey: string | null;
}) {
  const [pk, setPk] = useState(publishableKey);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRoll() {
    setRolling(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/api-keys/roll", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "publishable" }),
      });
      if (!res.ok) throw new Error("Failed to roll key");
      const data = await res.json();
      setPk(data.key);
    } catch {
      setError("Couldn't roll your publishable key. Try again.");
    } finally {
      setRolling(false);
    }
  }

  const snippet = `<UPayButton\n  apiKey="${pk ?? "pk_test_…"}"\n  amount={40}\n/>`;

  return (
    <div className="grid max-w-[1240px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
      {/* Settlement account */}
      <div className="rounded-[14px] border border-[#ECE8F1] bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-[14.5px] font-semibold text-upay-ink">Settlement account</span>
          <span className="inline-flex items-center gap-[5px] rounded-[6px] border border-[#CFEBDC] bg-[#E9F6EF] px-[9px] py-[3px] text-[11px] font-semibold text-[#1F7A4D]">
            ● Active
          </span>
        </div>
        <div className="mt-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#EAF0FF]">
            <TokenIcon token="Base" size={26} />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[14px] font-semibold text-upay-ink">{settlementAddress}</div>
            <div className="mt-0.5 text-[12.5px] text-[#8B8595]">{createdLabel}</div>
          </div>
          <div className="ml-auto">
            <CopyButton text={settlementAddress} />
          </div>
        </div>
        <div className="mt-3.5 border-t border-[#F4F2F7] pt-3.5 text-[12.5px] text-[#8B8595]">
          Your keys below are scoped to this account. All payments settle here as USDC on Base.
        </div>
      </div>

      {/* Publishable key */}
      <div className="rounded-[14px] border border-[#ECE8F1] bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-[14.5px] font-semibold text-upay-ink">Publishable key</span>
          <span className="rounded-[5px] bg-[#E9F6EF] px-2 py-[3px] text-[11px] font-medium text-[#1F7A4D]">
            Safe in client
          </span>
        </div>
        {pk ? (
          <>
            <div className="mt-[13px] flex items-center justify-between gap-3 rounded-[9px] border border-[#DCE7FF] bg-[#F0F4FF] px-3.5 py-2.5">
              <code className="font-mono text-[13.5px] font-medium text-upay-bluedark">{pk}</code>
              <CopyButton text={pk} />
            </div>
            <button
              type="button"
              onClick={handleRoll}
              disabled={rolling}
              className="mt-[13px] text-[13px] font-medium text-[#B0473F] transition-colors hover:underline disabled:opacity-60"
            >
              {rolling ? "Rolling…" : "Roll publishable key"}
            </button>
            {error && <p className="mt-1.5 text-[12.5px] text-[#B3261E]">{error}</p>}
          </>
        ) : (
          <div className="mt-[13px] flex flex-col gap-2.5">
            <p className="text-[13px] text-[#8B8595]">
              This key was created before we started showing publishable keys in the dashboard. Roll it once to
              see the full value here.
            </p>
            <button
              type="button"
              onClick={handleRoll}
              disabled={rolling}
              className="w-fit rounded-[9px] bg-upay-blue px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-upay-bluedark disabled:opacity-60"
            >
              {rolling ? "Rolling…" : "Roll publishable key"}
            </button>
            {error && <p className="text-[12.5px] text-[#B3261E]">{error}</p>}
          </div>
        )}
      </div>

      {/* Secret key: deferred until server-side usage (webhooks etc.) exists */}
      <div className="relative overflow-hidden rounded-[14px] border border-[#ECE8F1] bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-[14.5px] font-semibold text-upay-ink">Secret key</span>
          <span className="rounded-[5px] bg-[#FBECEA] px-2 py-[3px] text-[11px] font-medium text-[#B0473F]">
            Server only
          </span>
        </div>
        <div aria-hidden="true" className="pointer-events-none relative mt-[13px] select-none">
          <div className="flex items-center justify-between gap-3 rounded-[9px] border border-[#DCE7FF] bg-[#F0F4FF] px-3.5 py-2.5 opacity-40 blur-[3px]">
            <code className="font-mono text-[13.5px] text-[#8B8595]">sk_test_••••••••••••••••••••</code>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-[5px] border border-[#D6E2FF] bg-[#EAF0FF] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[.04em] text-[#5C7FE8]">
              Soon
            </span>
          </div>
        </div>
      </div>
      </div>

      {/* Usage snippet */}
      <div className="rounded-[14px] border border-[#ECE8F1] bg-white p-5 lg:sticky lg:top-5">
        <span className="text-[14.5px] font-semibold text-upay-ink">Use it in your app</span>
        <p className="mb-3 mt-1.5 text-[12.5px] text-[#8B8595]">
          Paste your publishable key into the UPayButton. That's all the SDK needs.
        </p>
        <div className="relative">
          <pre className="scrollbar-none overflow-x-auto whitespace-pre rounded-[10px] bg-[#1C1726] p-4 pt-12 font-mono text-[13px] leading-[1.8] text-[#D8D2E2]">
            {snippet}
          </pre>
          <div className="absolute right-3 top-3">
            <CopyButton tone="accent" text={snippet} />
          </div>
        </div>
      </div>
    </div>
  );
}
