import { NextRequest, NextResponse } from "next/server";
import { authenticateDashboardWallet, attachDashboardSession } from "@/lib/dashboard-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address : "";
  const signature = typeof body?.signature === "string" ? body.signature : "";
  if (!address || !signature) {
    return NextResponse.json({ error: "Missing address or signature" }, { status: 400 });
  }

  const result = await authenticateDashboardWallet(address, signature);
  if ("error" in result) {
    if (result.error === "needs_onboarding") {
      return NextResponse.json({ status: "needs_onboarding" });
    }
    return NextResponse.json({ error: "Signature didn't verify" }, { status: 401 });
  }

  const res = NextResponse.json({ status: "ok" });
  attachDashboardSession(res, result.merchantId);
  return res;
}
