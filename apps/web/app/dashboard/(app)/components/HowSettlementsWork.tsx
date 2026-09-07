const items = [
  {
    icon: "⚡",
    title: "Any token in",
    body: "Customers pay with whatever they hold. uPay's checkout connects their wallet and works from there.",
  },
  {
    icon: "↻",
    title: "Automatic conversion",
    body: "Circle's Unified Balance converts the payment to your settlement token in the same transaction.",
  },
  {
    icon: "🔒",
    title: "Straight to your wallet",
    body: "Funds land directly in your settlement address. uPay never custodies your funds.",
  },
];

export function HowSettlementsWork() {
  return (
    <div className="rounded-[14px] border border-[#ECE8F1] bg-white p-6 lg:sticky lg:top-5">
      <div className="mb-4 text-[14.5px] font-semibold text-upay-ink">How settlements work</div>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={item.title}
            className={`flex gap-3.5 py-3.5 ${i < items.length - 1 ? "border-b border-[#F4F2F7]" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#EAF0FF] text-[14px]">
              {item.icon}
            </span>
            <div>
              <div className="text-[14px] font-semibold text-upay-ink">{item.title}</div>
              <p className="mt-0.5 text-[13px] text-[#6B6577]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
