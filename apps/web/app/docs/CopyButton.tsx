"use client";

import { useState } from "react";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "rounded-[7px] bg-[#EAF0FF] px-3 py-1.5 text-[12.5px] font-semibold text-[#1F45D9] transition-colors hover:bg-[#DCE7FF]"
      }
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
