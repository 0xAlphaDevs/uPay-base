import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Anon-key client. Safe to import from client components — RLS on every
 * table restricts it to nothing beyond what policies explicitly allow.
 */
export const supabase = createClient(supabaseUrl, anonKey);

/**
 * Service-role client. Bypasses RLS entirely — server-only. Only import
 * this from route handlers (app/api/**) or other server-side code, never
 * from a "use client" component or anything that ends up in the browser
 * bundle.
 */
export function supabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side Supabase access.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
