import { NextResponse } from "next/server";

// UPay's whole pitch is "drop this SDK on any merchant's site" — every /api/v1
// route is authenticated by a pk_/sk_ Bearer key, not cookies/session, so origin
// isn't a meaningful trust boundary here. Open CORS on purpose, same conclusion
// the v1 (Particle-based) UPay build's ROADMAP.md reached after hitting this
// exact bug with a hardcoded origin allowlist.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

export function withCors(res: NextResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
