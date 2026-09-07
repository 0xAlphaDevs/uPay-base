"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "API keys", href: "/dashboard/api-keys", icon: "🔑" },
  { label: "Payments", href: "/dashboard", icon: "💳" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

const comingSoon = [
  "Subscriptions",
  "Borrow",
  "Treasury",
  "Invoices & billing",
  "Webhooks",
  "Analytics",
  "Off-ramps",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex h-full w-full flex-col border-r border-[#ECE8F1] bg-white px-3.5 py-5"
    >
      <Link href="/" className="mb-[22px] flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7 rounded-[8px]" />
        <span className="text-[16px] font-semibold text-upay-ink">uPay</span>
      </Link>

      <div className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[.06em] text-[#B3ADBC]">
        Merchant
      </div>
      <div className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2 ${
                isActive ? "bg-[#EAF0FF] font-semibold text-upay-bluedark" : "font-medium text-[#4A4458] hover:bg-[#F9F7F2]"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mb-2 mt-5 px-2.5 text-[11px] font-semibold uppercase tracking-[.06em] text-[#B3ADBC]">
        Coming soon
      </div>
      <div className="flex flex-col gap-0.5">
        {comingSoon.map((label) => (
          <div key={label} className="flex items-center justify-between rounded-[9px] px-2.5 py-2.5 text-[14px] font-medium text-[#B3ADBC]">
            {label}
            <span className="rounded-[5px] border border-[#D6E2FF] bg-[#EAF0FF] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[.04em] text-[#5C7FE8]">
              Soon
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 pt-4">
        <Link
          href="/"
          className="rounded-[9px] px-2.5 py-2.5 text-left text-[13.5px] font-medium text-[#6B6577] transition-colors hover:bg-[#F9F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
        >
          ← Back to site
        </Link>
      </div>
    </nav>
  );
}
