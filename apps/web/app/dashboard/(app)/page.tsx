import { redirect } from "next/navigation";
import { getDashboardMerchant } from "@/lib/dashboard-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { PaymentsView, type PaymentRow, type PaymentStats } from "./components/PaymentsView";
import type { PaymentStatus } from "./components/StatusBadge";

function statusLabel(status: string): PaymentStatus {
  if (status === "settled") return "Paid";
  if (status === "failed") return "Failed";
  return "Pending";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncate(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export default async function PaymentsPage() {
  const merchant = await getDashboardMerchant();
  if (!merchant) redirect("/dashboard/login");

  const db = supabaseAdmin();
  const { data: rows, error } = await db
    .from("payments")
    .select("id, amount, payer_address, source_token, source_chain, spend_tx_hash, status, created_at")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load payments");
  }

  const payments: PaymentRow[] = (rows ?? []).map((row) => ({
    id: row.id.slice(0, 8),
    date: formatDate(row.created_at),
    amount: Number(row.amount).toFixed(2),
    payer: truncate(row.payer_address),
    via: row.source_token ?? "—",
    viaChain: row.source_chain ? row.source_chain.replace(/_/g, " ") : "—",
    status: statusLabel(row.status),
    hash: row.spend_tx_hash,
    explorerUrl: row.spend_tx_hash ? `https://sepolia.basescan.org/tx/${row.spend_tx_hash}` : null,
  }));

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const settled30d = (rows ?? [])
    .filter((row) => row.status === "settled" && new Date(row.created_at).getTime() >= thirtyDaysAgo)
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const sourceChains = new Set((rows ?? []).map((row) => row.source_chain).filter(Boolean)).size;

  const stats: PaymentStats = {
    settled30d: `$${settled30d.toFixed(2)}`,
    paymentsCount: payments.length,
    sourceChains,
  };

  return <PaymentsView payments={payments} stats={stats} />;
}
