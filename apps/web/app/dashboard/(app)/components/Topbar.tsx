import { supabaseAdmin } from "@/lib/supabase";
import type { DashboardMerchant } from "@/lib/dashboard-auth";
import { LogoutButton } from "./LogoutButton";
import { WalletAvatar } from "./WalletAvatar";

async function getSettledTotal(merchantId: string) {
  const db = supabaseAdmin();
  const { data } = await db
    .from("payments")
    .select("amount")
    .eq("merchant_id", merchantId)
    .eq("status", "settled");

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return total.toFixed(2);
}

export async function Topbar({ merchant }: { merchant: DashboardMerchant }) {
  const settledTotal = await getSettledTotal(merchant.id);

  return (
    <header className="flex h-auto min-h-[57px] flex-wrap items-center justify-between gap-y-2 border-b border-[#ECE8F1] bg-white px-7 py-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[15px] font-semibold text-upay-ink">{merchant.name}</span>
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#CFEBDC] bg-[#E9F6EF] px-2.5 py-[3px] text-[11.5px] font-medium text-[#1F7A4D]">
          ● Live
        </span>
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#F0C36D] bg-[#FFF8E6] px-2.5 py-[3px] text-[11px] font-medium text-[#8A6100]">
          ⚠ Base Sepolia, test funds only
        </span>
      </div>

      <div className="flex items-center gap-[18px]">
        <div className="text-right">
          <div className="text-[11px] font-medium text-[#A39DAD]">Total settled</div>
          <div className="font-mono text-[14px] font-semibold text-upay-ink">{settledTotal} USDC</div>
        </div>
        <WalletAvatar address={merchant.owner_address ?? merchant.settlement_address} size={32} />
        <LogoutButton />
      </div>
    </header>
  );
}
