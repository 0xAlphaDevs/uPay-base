"use client";

import { UPayButton } from "upay-base-sdk";

export function LiveDemoCard() {
  const apiKey = process.env.NEXT_PUBLIC_UPAY_DEMO_API_KEY;
  const checkoutUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div style={{ animation: "upf .7s ease .1s both" }}>
      <div
        className="overflow-hidden rounded-[18px] border border-[#ECE8F1] bg-white shadow-[0_1px_3px_rgba(27,22,34,.05),0_30px_70px_rgba(27,18,38,.13)]"
        style={{ animation: "floaty 6s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-[7px] border-b border-[#F0EDF4] bg-[#FBFAFC] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E0EA]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E0EA]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E4E0EA]" />
          <span className="ml-2 font-mono text-[12px] font-medium text-[#A39DAD]">pixelthreads.xyz</span>
        </div>
        <div className="p-[22px]">
          <div
            className="relative flex h-[172px] items-end justify-center rounded-xl border border-[#D6E2FF] p-3"
            style={{
              background:
                "repeating-linear-gradient(135deg,#EAF0FF,#EAF0FF 11px,#DCE7FF 11px,#DCE7FF 22px)",
            }}
          >
            <span className="rounded-md border border-[#D6E2FF] bg-white px-[9px] py-1 font-mono text-[11px] font-medium text-[#7B93E0]">
              product shot
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-[16px] font-semibold text-[#15101C]">Aurora Hoodie</div>
              <div className="mt-0.5 text-[13.5px] text-[#8B8595]">Limited drop · unisex</div>
            </div>
            <div className="font-mono text-[18px] font-semibold text-[#15101C]">$1</div>
          </div>

          <div className="upay-demo-btn mt-4">
            {apiKey ? (
              <UPayButton apiKey={apiKey} amount={1} settle={{ token: "USDC", chain: "base" }} checkoutUrl={checkoutUrl}>
                Pay with uPay
              </UPayButton>
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-upay-blue px-5 py-[15px] text-[16px] font-semibold text-white opacity-60"
              >
                Pay with uPay
              </button>
            )}
          </div>
          <div className="mt-[11px] text-center text-[11.5px] font-medium text-[#A39DAD]">
            🔒 Pay with any token · settles instantly
          </div>
        </div>
      </div>
      <div className="mt-3.5 text-center text-[12.5px] font-medium text-[#8B8595]">
        ↑ This button is live. Click it.
      </div>
    </div>
  );
}
