import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

const SETTLE_TOKENS = ["USDC", "EURC"] as const;
type SettleToken = (typeof SETTLE_TOKENS)[number];

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

async function authenticate(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key) return null;

  const db = supabaseAdmin();
  const { data } = await db
    .from("api_keys")
    .select("merchant_id, revoked")
    .eq("key_hash", hashKey(key))
    .maybeSingle();

  if (!data || data.revoked) return null;
  return data.merchant_id as string;
}

export async function POST(req: NextRequest) {
  const merchantId = await authenticate(req);
  if (!merchantId) {
    return withCors(NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 }));
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.amount !== "number" || !(body.amount > 0)) {
    return withCors(NextResponse.json({ error: "amount must be a positive number" }, { status: 400 }));
  }

  const db = supabaseAdmin();
  const { data: merchant, error: merchantError } = await db
    .from("merchants")
    .select("settlement_address, settlement_token")
    .eq("id", merchantId)
    .single();

  if (merchantError || !merchant) {
    return withCors(NextResponse.json({ error: "Merchant not found" }, { status: 404 }));
  }

  // The SDK caller can force a token, but by default a session settles to
  // whatever the merchant configured in Settings (dashboard) — not a
  // hardcoded value, so that page actually has an effect on real checkouts.
  const settleToken: SettleToken = SETTLE_TOKENS.includes(body.token)
    ? body.token
    : (merchant.settlement_token as SettleToken);

  const { data: session, error } = await db
    .from("checkout_sessions")
    .insert({
      merchant_id: merchantId,
      amount: body.amount,
      settle_token: settleToken,
      recipient: typeof body.recipient === "string" ? body.recipient : merchant.settlement_address,
      metadata: typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {},
      success_url: typeof body.success_url === "string" ? body.success_url : null,
      cancel_url: typeof body.cancel_url === "string" ? body.cancel_url : null,
      is_subscription: Boolean(body.is_subscription),
    })
    .select("id")
    .single();

  if (error || !session) {
    return withCors(NextResponse.json({ error: "Failed to create session" }, { status: 500 }));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return withCors(
    NextResponse.json({ id: session.id, checkout_url: `${appUrl}/checkout/${session.id}` }, { status: 201 }),
  );
}
