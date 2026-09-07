"use client";

import { UPayButton } from "upay-base-sdk";

export function TryLiveButton() {
  const apiKey = process.env.NEXT_PUBLIC_UPAY_DEMO_API_KEY;

  return (
    <div className="mt-4 flex flex-col items-center gap-3.5 rounded-2xl border border-[#ECE8F1] bg-[#FCFBFE] p-[30px]">
      <div className="text-[13px] font-semibold uppercase tracking-[.04em] text-[#A39DAD]">UPayButton · $1.00</div>
      {apiKey ? (
        <UPayButton apiKey={apiKey} amount={1}>
          Pay with uPay
        </UPayButton>
      ) : (
        <button type="button" disabled className="rounded-xl bg-upay-blue px-[26px] py-3.5 text-[16px] font-semibold text-white opacity-60">
          Pay with uPay
        </button>
      )}
    </div>
  );
}
