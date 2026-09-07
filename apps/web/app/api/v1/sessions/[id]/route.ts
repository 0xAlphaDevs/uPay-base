import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();

  const { data: session, error } = await db
    .from("checkout_sessions")
    .select("id, amount, settle_token, recipient, status, is_subscription, created_at, expires_at, merchant_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !session) {
    return withCors(NextResponse.json({ error: "Session not found" }, { status: 404 }));
  }

  const { data: merchant } = await db.from("merchants").select("name").eq("id", session.merchant_id).maybeSingle();

  const isExpired = session.status === "pending" && new Date(session.expires_at) < new Date();

  return withCors(
    NextResponse.json({
      id: session.id,
      amount: session.amount,
      settle_token: session.settle_token,
      recipient: session.recipient,
      status: isExpired ? "expired" : session.status,
      is_subscription: session.is_subscription,
      created_at: session.created_at,
      expires_at: session.expires_at,
      merchant_name: merchant?.name ?? "Merchant",
    }),
  );
}
