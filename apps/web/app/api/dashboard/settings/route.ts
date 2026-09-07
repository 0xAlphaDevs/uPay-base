import { NextRequest, NextResponse } from "next/server";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const merchant = await getDashboardMerchant();
  if (!merchant) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const settlementToken = body?.settlement_token;
  if (settlementToken !== "USDC" && settlementToken !== "EURC") {
    return NextResponse.json({ error: "settlement_token must be 'USDC' or 'EURC'" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("merchants").update({ settlement_token: settlementToken }).eq("id", merchant.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
