"use client";

import { UPayButton } from "upay-base-sdk";

const products = [{ id: "1", name: "Aurora Hoodie", desc: "Limited drop · unisex", price: 3 }];

const apiKey = process.env.NEXT_PUBLIC_UPAY_API_KEY ?? "";
const checkoutUrl = process.env.NEXT_PUBLIC_UPAY_CHECKOUT_URL ?? "http://localhost:3000";

export default function StorePage() {
  return (
    <main className="min-h-screen">
      <div className="bg-[#15101C] text-white">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-[19px] font-bold tracking-[-0.02em]">Pixel Threads</span>
            <span className="h-[18px] w-px bg-[#3A3348]" />
            <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#B3A9C4]">
              Powered by
              <span className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="" width={16} height={16} className="h-4 w-4 rounded-[5px]" />
                uPay
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1040px] px-6 py-14">
        <h1 className="text-[36px] font-bold tracking-[-0.03em] text-[#15101C]">
          New drop: Summer &apos;26
        </h1>
        {!apiKey && (
          <p className="mt-3 max-w-[520px] rounded-lg border border-[#F0C36D] bg-[#FFF8E6] px-3.5 py-2.5 text-[13px] text-[#8A6100]">
            Set <code className="rounded bg-white px-1 py-0.5">NEXT_PUBLIC_UPAY_API_KEY</code> in{" "}
            <code className="rounded bg-white px-1 py-0.5">apps/demo-store/.env.local</code> to a seeded merchant's
            publishable key before the Pay button will work.
          </p>
        )}

        <div className="mt-8 grid max-w-[340px] grid-cols-1 gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-2xl border border-[#ECE8F1] bg-white shadow-sm"
            >
              <div className="h-[200px] border-b border-[#DCE7FF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/demo.png" alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2.5">
                  <span className="text-[16px] font-semibold text-[#15101C]">{p.name}</span>
                  <span className="font-mono text-[16px] font-semibold text-[#15101C]">
                    ${p.price}
                  </span>
                </div>
                <div className="mt-1 text-[13.5px] text-[#8B8595]">{p.desc}</div>
                <div className="mt-4">
                  <UPayButton apiKey={apiKey} checkoutUrl={checkoutUrl} amount={p.price} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
