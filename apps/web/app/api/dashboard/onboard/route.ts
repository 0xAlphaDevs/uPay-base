import { NextRequest, NextResponse } from "next/server";
import { createMerchantWithWallet, attachDashboardSession } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address : "";
  const signature = typeof body?.signature === "string" ? body.signature : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!address || !signature) {
    return NextResponse.json({ error: "Missing address or signature" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Enter your business name" }, { status: 400 });
  }

  const result = await createMerchantWithWallet(address, signature, name);
  if ("error" in result) {
    const status = result.error === "invalid_signature" ? 401 : 500;
    const message = result.error === "invalid_signature" ? "Signature didn't verify" : "Failed to create merchant";
    return NextResponse.json({ error: message }, { status });
  }

  const res = NextResponse.json({ status: "ok" });
  attachDashboardSession(res, result.merchantId);
  return res;
}
