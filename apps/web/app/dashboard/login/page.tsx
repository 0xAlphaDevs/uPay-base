import { ConnectWalletStep } from "./ConnectWalletStep";

export default function DashboardLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-upay-paper px-6">
      <div className="w-full max-w-[380px] rounded-2xl border border-[#ECE8F1] bg-white p-8">
        <div className="mb-6 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7 rounded-[8px]" />
          <span className="text-[16px] font-semibold text-upay-ink">uPay dashboard</span>
        </div>

        <h1 className="text-[19px] font-semibold text-upay-ink">Connect your wallet</h1>
        <p className="mt-1.5 text-[13.5px] text-[#6B6577]">
          We&apos;ll ask you to sign a message to prove you own the wallet. No gas, no transaction. First time here?
          You&apos;ll set your business name right after.
        </p>

        <div className="mt-5">
          <ConnectWalletStep />
        </div>

        <div className="mt-5 border-t border-[#F0EDF4] pt-4 text-center text-[12.5px] text-[#8B8595]">
          ⚠ Base Sepolia, test funds only
        </div>
      </div>
    </main>
  );
}
