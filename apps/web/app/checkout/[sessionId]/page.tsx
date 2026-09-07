import { supabaseAdmin } from "@/lib/supabase";
import { CheckoutFlow } from "./CheckoutFlow";
import { EmbedCloseButton } from "./EmbedCloseButton";
import { ResizeReporter } from "./ResizeReporter";

async function getSession(id: string) {
  const db = supabaseAdmin();
  const { data: session } = await db
    .from("checkout_sessions")
    .select("id, amount, settle_token, recipient, status, is_subscription, expires_at, merchant_id")
    .eq("id", id)
    .maybeSingle();

  if (!session) return null;

  const { data: merchant } = await db.from("merchants").select("name").eq("id", session.merchant_id).maybeSingle();

  const isExpired = session.status === "pending" && new Date(session.expires_at) < new Date();

  return { ...session, status: isExpired ? "expired" : session.status, merchantName: merchant?.name ?? "Merchant" };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { sessionId: string };
  searchParams: { embed?: string };
}) {
  const session = await getSession(params.sessionId);
  const embed = searchParams.embed === "1";

  if (!session) {
    return (
      <main className={embed ? "bg-white p-6 text-center" : "flex min-h-screen items-center justify-center bg-upay-paper px-6"}>
        <div className={embed ? "" : "max-w-[380px] rounded-2xl border border-[#ECE8F1] bg-white p-8 text-center"}>
          <h1 className="text-[18px] font-semibold text-upay-ink">Session not found</h1>
          <p className="mt-2 text-[13.5px] text-[#6B6577]">
            This checkout link is invalid or the session no longer exists.
          </p>
        </div>
      </main>
    );
  }

  const cardContent = (
    <>
      <div className="flex items-center justify-between border-b border-[#F0EDF4] px-5 py-[15px]">
        <span className="flex items-center gap-[7px] text-[12.5px] font-medium text-[#8B8595]">
          🔒 Secured by
          <span className="flex items-center gap-1 font-semibold text-upay-bluedark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-[4px]" />
            uPay
          </span>
        </span>
        {embed && <EmbedCloseButton sessionId={session.id} />}
      </div>

      <div className="px-[22px] pt-[22px]">
        <div className="text-[13px] font-medium text-[#8B8595]">{session.merchantName}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-[34px] font-bold tracking-[-.02em] text-upay-ink">
            {Number(session.amount).toFixed(2)}
          </span>
          <span className="text-[14px] font-medium text-[#8B8595]">{session.settle_token}</span>
        </div>
      </div>

      <div className="mx-[22px] mt-4 inline-flex items-center gap-2 rounded-full border border-[#F0C36D] bg-[#FFF8E6] px-3 py-1.5 text-[12.5px] font-medium text-[#8A6100]">
        ⚠ Base Sepolia — test funds only
      </div>

      <div className="px-[22px] py-[22px]">
        {session.status === "expired" && (
          <div className="rounded-lg border border-[#F5D0CC] bg-[#FDEAEA] px-3.5 py-3 text-[13.5px] text-[#B3261E]">
            This checkout session has expired.
          </div>
        )}
        {session.status === "paid" && (
          <div className="rounded-lg border border-[#CFEBDC] bg-[#E9F6EF] px-3.5 py-3 text-[13.5px] text-[#1F7A4D]">
            This session has already been paid.
          </div>
        )}
        {session.status === "pending" && (
          <CheckoutFlow
            sessionId={session.id}
            amount={Number(session.amount)}
            settleToken={session.settle_token as "USDC" | "EURC"}
            recipient={session.recipient}
            embed={embed}
          />
        )}
      </div>
    </>
  );

  return (
    <main className={embed ? "bg-white" : "flex min-h-screen items-center justify-center bg-upay-paper px-6 py-16"}>
      {embed && <style>{`html, body { overflow: hidden; height: 100%; }`}</style>}
      {embed ? (
        <ResizeReporter sessionId={session.id} className="w-full bg-white">
          {cardContent}
        </ResizeReporter>
      ) : (
        <div className="w-full max-w-[418px] overflow-hidden rounded-[20px] border border-[#ECE8F1] bg-white shadow-[0_30px_70px_rgba(27,18,38,.12)]">
          {cardContent}
        </div>
      )}
    </main>
  );
}
