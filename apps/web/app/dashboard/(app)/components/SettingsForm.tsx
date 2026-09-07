"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TokenIcon } from "@/app/components/TokenIcon";

interface Option {
  value: "USDC" | "EURC";
  label: string;
}

const tokenOptions: Option[] = [
  { value: "USDC", label: "USDC" },
  { value: "EURC", label: "EURC" },
];

const baseSepolia = { value: "Base Sepolia", label: "Base Sepolia" };

function OptionPills({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Option[];
  value: string;
  onChange: (value: "USDC" | "EURC") => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-upay-blue has-[:focus-visible]:ring-offset-2 ${
              checked
                ? "border-upay-blue bg-[#EAF0FF] text-upay-bluedark"
                : "border-[#E6E1EC] bg-white text-[#4A4458] hover:bg-[#F9F7F2]"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <TokenIcon token={option.value} className="rounded-full" />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export function SettingsForm({
  settlementAddress,
  initialToken,
}: {
  settlementAddress: string;
  initialToken: "USDC" | "EURC";
}) {
  const router = useRouter();
  const [token, setToken] = useState<"USDC" | "EURC">(initialToken);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedToken = tokenOptions.find((option) => option.value === token) ?? tokenOptions[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settlement_token: token }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Couldn't save your settings. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-[14px] border border-[#ECE8F1] bg-white p-6"
    >
      <div>
        <label htmlFor="settlementAddress" className="text-[13px] font-semibold text-upay-ink">
          Settlement address
        </label>
        <div
          id="settlementAddress"
          className="mt-2 flex items-center justify-between rounded-[9px] border border-[#DCE7FF] bg-[#F0F4FF] px-3.5 py-3 font-mono text-[14px] font-medium text-upay-bluedark"
        >
          {settlementAddress}
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-[13px] font-semibold text-upay-ink">Receive as</div>
        <OptionPills name="Receive as" options={tokenOptions} value={token} onChange={setToken} />
        {token === "EURC" && (
          <p className="mt-2.5 rounded-lg border border-[#F0C36D] bg-[#FFF8E6] px-3 py-2.5 text-[12.5px] text-[#8A6100]">
            Heads up: checkout currently blocks payment for EURC-settling merchants. Circle App Kit's Unified
            Balance doesn't support EURC deposit/spend yet. Customers won't be able to pay until that lands.
          </p>
        )}
      </div>

      <div>
        <div className="mb-2.5 text-[13px] font-semibold text-upay-ink">On chain</div>
        <div className="flex items-center gap-2 rounded-full border border-upay-blue bg-[#EAF0FF] px-4 py-2.5 text-[14px] font-semibold text-upay-bluedark">
          <TokenIcon token="Base Sepolia" className="rounded-full" />
          {baseSepolia.label}
        </div>
        <p className="mt-2 text-[12.5px] text-[#A39DAD]">
          Base mainnet settlement is coming soon. Every uPay payment settles here on Base Sepolia for now.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-[9px] border border-[#DCE7FF] bg-[#F0F4FF] px-3.5 py-3 text-[14px] text-upay-ink">
        <span>You receive</span>
        <TokenIcon token={selectedToken.value} className="rounded-full" />
        <span className="font-semibold">{selectedToken.label}</span>
        <span>on</span>
        <TokenIcon token="Base Sepolia" className="rounded-full" />
        <span className="font-semibold">{baseSepolia.label}</span>
      </div>

      <button
        type="submit"
        disabled={saving}
        role="status"
        className={`w-full rounded-[11px] px-5 py-3 text-[14.5px] font-semibold text-white shadow-[0_1px_2px_rgba(45,91,255,.35)] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2 ${
          saved ? "bg-[#1E7A3D]" : "bg-upay-blue hover:bg-upay-bluedark"
        }`}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
      {error && <p className="-mt-3 text-[12.5px] text-[#B3261E]">{error}</p>}
      <p className="-mt-3 text-[12.5px] font-medium text-[#A39DAD]">
        Settle on Base Sepolia · pay-in from Arc, Base, or Ethereum testnets
      </p>
    </form>
  );
}
