import { NextRequest, NextResponse } from "next/server";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { generateApiKey } from "@/lib/keys";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const merchant = await getDashboardMerchant();
  if (!merchant) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type === "publishable" || body?.type === "secret" ? body.type : null;
  if (!type) {
    return NextResponse.json({ error: "type must be 'publishable' or 'secret'" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const generated = generateApiKey(type);

  await db
    .from("api_keys")
    .update({ revoked: true })
    .eq("merchant_id", merchant.id)
    .eq("type", type)
    .eq("revoked", false);

  const { error } = await db.from("api_keys").insert({
    merchant_id: merchant.id,
    key_prefix: generated.prefix,
    key_hash: generated.hash,
    key_plaintext: type === "publishable" ? generated.key : null,
    type,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to roll key" }, { status: 500 });
  }

  return NextResponse.json({ key: generated.key, type });
}
