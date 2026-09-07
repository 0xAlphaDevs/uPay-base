import { NextRequest, NextResponse } from "next/server";
import { corsPreflight, withCors } from "@/lib/cors";

// rpc.testnet.arc.io answers fine but sends no Access-Control-Allow-Origin
// header at all, so browsers block direct client-side JSON-RPC calls to it
// (confirmed with a manual curl — the endpoint itself isn't down). This route
// proxies requests server-side, where CORS doesn't apply, and adds it back on
// the response so wagmi/viem's browser-side reads (e.g. AppKit's balance
// display) work. lib/chains.ts points arcTestnet's rpcUrls here instead of
// directly at the upstream URL.
const ARC_RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.io";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const upstream = await fetch(ARC_RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const data = await upstream.text();
  return withCors(new NextResponse(data, { status: upstream.status, headers: { "content-type": "application/json" } }));
}
