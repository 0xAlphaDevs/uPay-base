import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { verifyMessage } from "viem";
import { supabaseAdmin } from "./supabase";
import { generateApiKey } from "./keys";
import { walletLoginMessage } from "./wallet-auth-message";

// Demo-scope session: the cookie is "<merchantId>.<hmac>", signed with
// DASHBOARD_SESSION_SECRET so it can't be forged, but there's no expiry
// beyond the cookie's own maxAge and no per-session revocation list,
// an acceptable trade for a hackathon-scope dashboard with no real user
// accounts. Minted by connecting + signing with the wallet stored as the
// merchant's owner_address — no key-paste login path (removed: pasting an
// sk_ key into a browser form to authenticate a dashboard session gave it a
// much bigger blast radius than its intended server-only use).
export const DASHBOARD_COOKIE = "upay_dashboard_session";

export interface DashboardMerchant {
  id: string;
  name: string;
  email: string | null;
  owner_address: string | null;
  settlement_address: string;
  settlement_token: "USDC" | "EURC";
}

function sessionSecret() {
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) throw new Error("DASHBOARD_SESSION_SECRET is not set");
  return secret;
}

function signMerchantId(merchantId: string) {
  const mac = createHmac("sha256", sessionSecret()).update(merchantId).digest("hex");
  return `${merchantId}.${mac}`;
}

function verifySessionCookie(value: string): string | null {
  const [merchantId, mac] = value.split(".");
  if (!merchantId || !mac) return null;

  const expected = createHmac("sha256", sessionSecret()).update(merchantId).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return merchantId;
}

function setDashboardCookie(res: { cookies: { set: (name: string, value: string, opts: object) => void } }, merchantId: string) {
  res.cookies.set(DASHBOARD_COOKIE, signMerchantId(merchantId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getDashboardMerchant(): Promise<DashboardMerchant | null> {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get(DASHBOARD_COOKIE)?.value;
  if (!cookieValue) return null;

  const merchantId = verifySessionCookie(cookieValue);
  if (!merchantId) return null;

  const db = supabaseAdmin();
  const { data: merchant } = await db
    .from("merchants")
    .select("id, name, email, owner_address, settlement_address, settlement_token")
    .eq("id", merchantId)
    .maybeSingle();

  return (merchant as DashboardMerchant) ?? null;
}

/** Wallet-connect login path — verifies the signature, then looks up owner_address. */
export async function authenticateDashboardWallet(address: string, signature: string) {
  const valid = await verifyMessage({
    address: address as `0x${string}`,
    message: walletLoginMessage(address),
    signature: signature as `0x${string}`,
  });
  if (!valid) return { error: "invalid_signature" as const };

  const db = supabaseAdmin();
  const { data } = await db
    .from("merchants")
    .select("id")
    .eq("owner_address", address.toLowerCase())
    .maybeSingle();

  if (!data) return { error: "needs_onboarding" as const };
  return { merchantId: data.id as string };
}

/** Creates a new merchant for a wallet that just onboarded, plus a starter API key pair. */
export async function createMerchantWithWallet(address: string, signature: string, name: string) {
  const valid = await verifyMessage({
    address: address as `0x${string}`,
    message: walletLoginMessage(address),
    signature: signature as `0x${string}`,
  });
  if (!valid) return { error: "invalid_signature" as const };

  const db = supabaseAdmin();
  const lower = address.toLowerCase();

  const { data: merchant, error } = await db
    .from("merchants")
    .insert({
      name,
      owner_address: lower,
      settlement_address: address,
      settlement_token: "USDC",
    })
    .select("id")
    .single();

  if (error || !merchant) return { error: "create_failed" as const };

  const pk = generateApiKey("publishable");
  const sk = generateApiKey("secret");
  await db.from("api_keys").insert([
    { merchant_id: merchant.id, key_prefix: pk.prefix, key_hash: pk.hash, key_plaintext: pk.key, type: "publishable" },
    { merchant_id: merchant.id, key_prefix: sk.prefix, key_hash: sk.hash, type: "secret" },
  ]);

  return { merchantId: merchant.id as string };
}

export function attachDashboardSession(res: { cookies: { set: (name: string, value: string, opts: object) => void } }, merchantId: string) {
  setDashboardCookie(res, merchantId);
}
