import { NextRequest, NextResponse } from "next/server";
import type { Address } from "viem";
import { supabaseAdmin } from "@/lib/supabase";
import { corsPreflight, withCors } from "@/lib/cors";
import { recordPaymentOnBase } from "@/lib/receipt";

export function OPTIONS() {
  return corsPreflight();
}

// Postgres unique_violation code — payments.session_id has a unique index,
// so a second call for the same session hits this instead of double-inserting.
const UNIQUE_VIOLATION = "23505";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.payer_address !== "string" || typeof body.deposit_tx_hash !== "string" || typeof body.spend_tx_hash !== "string") {
    return withCors(
      NextResponse.json(
        { error: "payer_address, deposit_tx_hash, and spend_tx_hash are required" },
        { status: 400 },
      ),
    );
  }

  const db = supabaseAdmin();

  const { data: session, error: sessionError } = await db
    .from("checkout_sessions")
    .select("id, merchant_id, amount, settle_token, status, merchants(settlement_address)")
    .eq("id", params.id)
    .maybeSingle();

  if (sessionError || !session) {
    return withCors(NextResponse.json({ error: "Session not found" }, { status: 404 }));
  }

  const { data: payment, error: paymentError } = await db
    .from("payments")
    .insert({
      session_id: session.id,
      merchant_id: session.merchant_id,
      payer_address: body.payer_address,
      settle_token: session.settle_token,
      amount: session.amount,
      source_chain: typeof body.source_chain === "string" ? body.source_chain : null,
      source_token: typeof body.source_token === "string" ? body.source_token : null,
      deposit_tx_hash: body.deposit_tx_hash,
      // Structured per-chain breakdown (chain/amount/txHash/explorerUrl) when the
      // payment drew from more than one chain — source_chain/deposit_tx_hash above
      // are a joined-string summary of the same data, kept for the existing
      // dashboard Payments view.
      source_deposits: Array.isArray(body.source_deposits) ? body.source_deposits : null,
      spend_tx_hash: body.spend_tx_hash,
      status: "settled",
      settled_at: new Date().toISOString(),
    })
    .select("id, payer_address, settle_token, amount, source_chain, source_token, deposit_tx_hash, source_deposits, spend_tx_hash, status, settled_at")
    .single();

  if (paymentError) {
    if (paymentError.code === UNIQUE_VIOLATION) {
      const { data: existing } = await db
        .from("payments")
        .select("id, payer_address, settle_token, amount, source_chain, source_token, deposit_tx_hash, source_deposits, spend_tx_hash, status, settled_at")
        .eq("session_id", session.id)
        .single();
      return withCors(NextResponse.json({ session_id: session.id, payment: existing }, { status: 200 }));
    }
    return withCors(NextResponse.json({ error: "Failed to record payment" }, { status: 500 }));
  }

  if (session.status !== "paid") {
    await db.from("checkout_sessions").update({ status: "paid" }).eq("id", session.id);
  }

  // Best-effort onchain receipt on Base (see lib/receipt.ts) — attribution/audit trail only,
  // never blocks or fails the checkout response. Settlement already completed via Circle
  // Gateway above; a relayer/contract misconfiguration here should never surface to the payer.
  let receiptTxHash: string | null = null;
  if (session.settle_token === "USDC") {
    const merchantRecord = Array.isArray(session.merchants) ? session.merchants[0] : session.merchants;
    const settlementAddress = merchantRecord?.settlement_address as string | undefined;
    if (settlementAddress) {
      try {
        receiptTxHash = await recordPaymentOnBase({
          sessionId: session.id,
          merchant: settlementAddress as Address,
          payer: body.payer_address as Address,
          amountDecimal: String(session.amount),
        });
      } catch (err) {
        console.error(`[receipt] failed to record session ${session.id} on Base:`, err);
      }
    }
  }

  return withCors(NextResponse.json({ session_id: session.id, payment, receipt_tx_hash: receiptTxHash }, { status: 201 }));
}
