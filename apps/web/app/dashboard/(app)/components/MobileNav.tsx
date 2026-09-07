"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "API keys", href: "/dashboard/api-keys" },
  { label: "Payments", href: "/dashboard" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex gap-1 overflow-x-auto border-b border-[#EFEAE0] bg-white px-4 py-2 md:hidden"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2 ${
              isActive ? "bg-[#EEF2FF] text-upay-bluedark" : "text-[#4A4458] hover:bg-[#F9F7F2]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
