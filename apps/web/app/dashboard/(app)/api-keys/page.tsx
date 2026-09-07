import { redirect } from "next/navigation";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ApiKeysView } from "../components/ApiKeysView";

export default async function ApiKeysPage() {
  const merchant = await getDashboardMerchant();
  if (!merchant) redirect("/dashboard/login");

  const db = supabaseAdmin();
  const { data: pkRow } = await db
    .from("api_keys")
    .select("key_plaintext, created_at")
    .eq("merchant_id", merchant.id)
    .eq("type", "publishable")
    .eq("revoked", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const createdLabel = pkRow?.created_at
    ? `Created ${new Date(pkRow.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "";

  return (
    <div>
      <h1 className="mb-1.5 text-[26px] font-bold tracking-[-.02em] text-upay-ink">API keys</h1>
      <p className="mb-[22px] text-[14px] text-[#6B6577]">
        Everything you need to start accepting payments.
      </p>

      <ApiKeysView
        settlementAddress={merchant.settlement_address}
        createdLabel={createdLabel}
        publishableKey={pkRow?.key_plaintext ?? null}
      />
    </div>
  );
}
