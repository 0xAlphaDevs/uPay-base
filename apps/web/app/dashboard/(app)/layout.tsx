import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { MobileNav } from "./components/MobileNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const merchant = await getDashboardMerchant();
  if (!merchant) redirect("/dashboard/login");

  return (
    <div className="flex min-h-screen bg-upay-paper">
      <div className="hidden w-60 shrink-0 md:block">
        <div className="fixed h-screen w-60">
          <Sidebar />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar merchant={merchant} />
        <MobileNav />
        <main className="flex-1 px-6 py-8 md:px-10">
          <div className="mx-auto max-w-[1040px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
