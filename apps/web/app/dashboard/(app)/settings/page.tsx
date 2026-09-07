import { redirect } from "next/navigation";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { SettingsForm } from "../components/SettingsForm";
import { HowSettlementsWork } from "../components/HowSettlementsWork";

export default async function SettingsPage() {
  const merchant = await getDashboardMerchant();
  if (!merchant) redirect("/dashboard/login");

  return (
    <div>
      <h1 className="mb-1.5 text-[26px] font-bold tracking-[-.02em] text-upay-ink">Settlement settings</h1>
      <p className="mb-[22px] text-[14px] text-[#6B6577]">
        Choose exactly what you receive, regardless of what the customer pays with.
      </p>

      <div className="grid max-w-[1040px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
        <SettingsForm settlementAddress={merchant.settlement_address} initialToken={merchant.settlement_token} />
        <HowSettlementsWork />
      </div>
    </div>
  );
}
