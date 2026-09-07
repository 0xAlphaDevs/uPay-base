import Link from "next/link";
import { LiveDemoCard } from "./components/LiveDemoCard";
import { TokenIcon } from "./components/TokenIcon";

const DEMO_STORE_URL = process.env.NEXT_PUBLIC_DEMO_STORE_URL ?? "http://localhost:3001";

const sdkSnippet = `import { UPayButton } from 'upay-base-sdk'

<UPayButton
  apiKey="pk_test_..."
  amount={40}
/>`;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-upay-paper">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[900px] -translate-x-1/2"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(124,79,194,.16), rgba(124,79,194,0))" }}
        />

        <div className="relative mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-[84px]">
          <div style={{ animation: "upf .6s ease both" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E2FF] bg-white py-1.5 pl-2 pr-3 text-[12.5px] font-medium text-[#1F45D9] shadow-[0_1px_2px_rgba(27,22,34,.04)]">
              <span className="h-4 w-4 rounded-[5px] bg-gradient-to-br from-[#4E7CFF] to-[#2D5BFF]" />
              Built on Base
            </div>

            <h1 className="mt-[22px] text-[42px] font-bold leading-[1.05] tracking-[-.035em] text-[#15101C] sm:text-[52px] lg:text-[60px]">
              The universal payment button,{" "}
              <span className="text-upay-blue">for humans and agents.</span>
            </h1>

            <p className="mt-[22px] max-w-[460px] text-[18px] leading-[1.55] text-[#4A4458]">
              Accepts payments from any chain, any token, in a single tap. You settle in USDC on
              Base, with chain abstraction built in.
            </p>

            <div className="mt-[30px] flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="rounded-[11px] bg-upay-blue px-[22px] py-3.5 text-[15.5px] font-semibold tracking-[-.01em] text-white shadow-[0_1px_2px_rgba(45,91,255,.35),0_12px_26px_rgba(45,91,255,.3)] transition-colors hover:bg-upay-bluedark"
              >
                Start integrating
              </Link>
              <Link
                href="/dashboard"
                className="rounded-[11px] border border-[#E6E1EC] bg-white px-[22px] py-3.5 text-[15.5px] font-semibold text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.08),0_12px_26px_rgba(27,22,34,.14)] transition-colors hover:bg-[#F9F7F2]"
              >
                View dashboard →
              </Link>
            </div>

            <div className="mt-[26px] inline-flex items-center gap-2 rounded-full border border-[#F0C36D] bg-[#FFF8E6] px-3 py-1.5 text-[12.5px] font-medium text-[#8A6100]">
              ⚠ Base Sepolia — test funds only
            </div>
          </div>

          <LiveDemoCard />
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="mx-auto max-w-[1120px] px-6 pb-6 pt-10">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[13px] font-semibold uppercase tracking-[.06em] text-[#5C7FE8]">
            How it works
          </div>
          <h2 className="mt-3 text-[30px] font-bold leading-[1.1] tracking-[-.03em] text-[#15101C] sm:text-[38px]">
            Chain abstraction, made invisible
          </h2>
          <p className="mt-3.5 text-[16px] leading-[1.55] text-[#4A4458] sm:text-[17px]">
            The customer never picks a chain, never bridges, never switches networks. uPay routes
            everything behind one tap.
          </p>
        </div>

        <div className="mt-[46px] grid grid-cols-1 gap-[18px] sm:grid-cols-3">
          <div className="rounded-2xl border border-[#ECE8F1] bg-white p-[26px] shadow-[0_1px_3px_rgba(27,22,34,.04)]">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#EAF0FF] font-mono text-[16px] font-bold text-upay-blue">
              1
            </div>
            <div className="mt-4 text-[18px] font-semibold text-[#15101C]">Merchant adds the button</div>
            <p className="mt-2 text-[14.5px] leading-[1.55] text-[#6B6577]">
              Drop in one component or a single script tag. Five lines and you accept crypto.
            </p>
            <div className="mt-4 rounded-[9px] border border-[#DCE7FF] bg-[#F0F4FF] px-[13px] py-[11px] font-mono text-[12.5px] font-medium text-upay-blue">
              &lt;UPayButton apiKey=&quot;pk_...&quot; /&gt;
            </div>
          </div>

          <div className="rounded-2xl border border-[#ECE8F1] bg-white p-[26px] shadow-[0_1px_3px_rgba(27,22,34,.04)]">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#EAF0FF] font-mono text-[16px] font-bold text-upay-blue">
              2
            </div>
            <div className="mt-4 text-[18px] font-semibold text-[#15101C]">Customer connects wallet</div>
            <p className="mt-2 text-[14.5px] leading-[1.55] text-[#6B6577]">
              Any wallet, any chain. Unified Balance pools their USDC across chains
              into one spendable balance.
            </p>
            <div className="mt-4 flex flex-wrap gap-[7px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE8F1] px-2.5 py-1.5 text-[12px] font-medium text-[#4A4458]">
                <TokenIcon token="USDC" size={13} className="rounded-full" />
                USDC · Base
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE8F1] px-2.5 py-1.5 text-[12px] font-medium text-[#4A4458]">
                <TokenIcon token="USDC" size={13} className="rounded-full" />
                USDC · Ethereum
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE8F1] px-2.5 py-1.5 text-[12px] font-medium text-[#4A4458]">
                <TokenIcon token="USDC" size={13} className="rounded-full" />
                USDC · Arc
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ECE8F1] bg-white p-[26px] shadow-[0_1px_3px_rgba(27,22,34,.04)]">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#E9F6EF] font-mono text-[16px] font-bold text-[#1F9D62]">
              3
            </div>
            <div className="mt-4 text-[18px] font-semibold text-[#15101C]">Payment settles on Base</div>
            <p className="mt-2 text-[14.5px] leading-[1.55] text-[#6B6577]">
              You receive USDC, instantly. The dashboard reflects it as soon as it lands.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#CFEBDC] bg-[#E9F6EF] px-3 py-2 text-[12.5px] font-semibold text-[#1F7A4D]">
              <TokenIcon token="USDC" size={13} className="rounded-full" />
              40.00 USDC · Base ✓
            </div>
          </div>
        </div>

        {/* CONVERGE VISUAL */}
        <div className="mt-[18px] rounded-[18px] border border-[#ECE8F1] bg-gradient-to-b from-white to-[#FCFBFE] p-6 shadow-[0_1px_3px_rgba(27,22,34,.04)] sm:p-[34px]">
          <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-[22px]">
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[.05em] text-[#A39DAD]">
                Customer holds
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 rounded-[11px] border border-[#ECE8F1] bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.04)]">
                  <TokenIcon token="USDC" size={18} className="rounded-full" />
                  82 USDC <span className="font-normal text-[#A39DAD]">· Base</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-[11px] border border-[#ECE8F1] bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.04)]">
                  <TokenIcon token="USDC" size={18} className="rounded-full" />
                  45 USDC <span className="font-normal text-[#A39DAD]">· Ethereum</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-[11px] border border-[#ECE8F1] bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.04)]">
                  <TokenIcon token="USDC" size={18} className="rounded-full" />
                  12 USDC <span className="font-normal text-[#A39DAD]">· Arc</span>
                </span>
              </div>
            </div>

            <div className="hidden text-[30px] font-light text-[#CFC7D8] sm:block">→</div>

            <div className="flex flex-col items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="uPay"
                width={64}
                height={64}
                className="h-16 w-16 rounded-[18px] shadow-[0_12px_30px_rgba(45,91,255,.4)]"
              />
              <div className="text-[13px] font-semibold text-[#1F45D9]">uPay routing</div>
              <div className="max-w-[130px] text-center text-[11.5px] font-medium text-[#A39DAD]">
                Deposit + spend, no bridging UI
              </div>
            </div>

            <div className="hidden text-[30px] font-light text-[#CFC7D8] sm:block">→</div>

            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-[.05em] text-[#A39DAD]">
                Merchant receives
              </div>
              <div className="rounded-[13px] border border-[#CFEBDC] bg-white p-4 shadow-[0_1px_3px_rgba(31,157,98,.1)]">
                <div className="flex items-center gap-2">
                  <TokenIcon token="USDC" size={22} className="rounded-full" />
                  <span className="font-mono text-[22px] font-bold text-[#15101C]">40.00</span>
                  <span className="text-[14px] font-semibold text-[#1B1622]">USDC</span>
                </div>
                <div className="mt-[7px] text-[13px] font-medium text-[#1F7A4D]">settled instantly</div>
                <div className="mt-2.5 border-t border-[#F0EDF4] pt-2.5 font-mono text-[12px] font-medium text-[#A39DAD]">
                  payments row → dashboard ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDK SNIPPET */}
      <div id="sdk" className="mx-auto max-w-[1120px] scroll-mt-10 px-6 py-14">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[.92fr_1.08fr]">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[.06em] text-[#5C7FE8]">
              Built for developers
            </div>
            <h2 className="mt-3 text-[28px] font-bold leading-[1.12] tracking-[-.03em] text-[#15101C] sm:text-[34px]">
              Five lines to accept any coin on any chain
            </h2>
            <p className="mt-3.5 text-[16px] leading-[1.6] text-[#4A4458] sm:text-[16.5px]">
              A React component or a server-side session. uPay handles wallet connection, routing,
              and settlement. You handle the order.
            </p>
            <Link
              href="/dashboard/api-keys"
              className="mt-6 inline-block rounded-[11px] border border-[#E6E1EC] bg-white px-5 py-[13px] text-[15px] font-semibold text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.04)] transition-colors hover:bg-[#F9F7F2]"
            >
              Get your API key →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[#1C1726] shadow-[0_30px_70px_rgba(27,18,38,.28)]">
            <div className="flex items-center gap-[7px] border-b border-[#2C2638] px-4 py-3.5">
              <span className="h-[11px] w-[11px] rounded-full bg-[#3A3348]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#3A3348]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#3A3348]" />
              <span className="ml-2 font-mono text-[12px] font-medium text-[#7C7488]">checkout.jsx</span>
            </div>
            <pre className="overflow-x-auto p-[22px] font-mono text-[13.5px] font-medium leading-[1.85] text-[#D8D2E2]">
              {sdkSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="border-y border-[#ECE8F1] bg-white">
        <div className="mx-auto max-w-[1120px] px-6 py-14">
          <div className="mb-10 text-center">
            <h2 className="text-[26px] font-bold tracking-[-.03em] text-[#15101C] sm:text-[30px]">
              Safe by architecture
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-[1.55] text-[#4A4458] sm:text-[16px]">
              uPay never touches custody. Funds move directly from the customer&apos;s account to
              yours.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
            <div className="rounded-2xl border border-[#ECE8F1] bg-[#FCFBFE] p-6">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#E9F6EF] text-[18px]">
                🔒
              </div>
              <div className="mt-3.5 text-[16.5px] font-semibold text-[#15101C]">Non-custodial</div>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-[#6B6577]">
                uPay never holds funds. Settlement is account-to-account, verifiable on-chain.
              </p>
            </div>
            <div className="rounded-2xl border border-[#ECE8F1] bg-[#FCFBFE] p-6">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#EAF0FF] font-mono text-[11px] font-bold text-upay-blue">
                UB
              </div>
              <div className="mt-3.5 text-[16.5px] font-semibold text-[#15101C]">Unified Balance</div>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-[#6B6577]">
                Unified Balance pools a customer&apos;s USDC across chains into one instantly spendable
                balance, no bridging screen.
              </p>
            </div>
            <div className="rounded-2xl border border-[#ECE8F1] bg-[#FCFBFE] p-6">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#EAF0FF]">
                <TokenIcon token="Base" size={26} />
              </div>
              <div className="mt-3.5 text-[16.5px] font-semibold text-[#15101C]">Built on Base</div>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-[#6B6577]">
                Settlement lands on Base, with chain abstraction handled automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-[1120px] px-6 py-20 text-center">
        <h2 className="text-[32px] font-bold leading-[1.1] tracking-[-.035em] text-[#15101C] sm:text-[40px]">
          Start accepting crypto
          <br />
          that actually feels like Stripe
        </h2>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="rounded-[11px] bg-upay-blue px-[26px] py-[15px] text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(45,91,255,.35),0_12px_26px_rgba(45,91,255,.3)] transition-colors hover:bg-upay-bluedark"
          >
            Start integrating
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[11px] border border-[#E6E1EC] bg-white px-[26px] py-[15px] text-[16px] font-semibold text-[#1B1622] shadow-[0_1px_2px_rgba(27,22,34,.08),0_12px_26px_rgba(27,22,34,.14)] transition-colors hover:bg-[#F9F7F2]"
          >
            View dashboard
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#ECE8F1] bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-[18px] px-6 py-8">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="uPay" width={26} height={26} className="h-[26px] w-[26px] rounded-[8px]" />
            <span className="text-[15px] font-semibold text-[#1B1622]">uPay</span>
          </Link>
          <div className="flex items-center gap-1">
            <a href={DEMO_STORE_URL} className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-[#4A4458] transition-colors hover:bg-[#EAF0FF] hover:text-[#1B1622]">
              Demo store
            </a>
            <Link href="/docs" className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-[#4A4458] transition-colors hover:bg-[#EAF0FF] hover:text-[#1B1622]">
              Docs
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-[#4A4458] transition-colors hover:bg-[#EAF0FF] hover:text-[#1B1622]">
              Dashboard
            </Link>
          </div>
        </div>
        <div className="border-t border-[#F4F2F7]">
          <div className="mx-auto flex max-w-[1120px] items-center justify-center px-6 py-4 text-[12.5px] font-medium text-[#8B8595]">
            <a
              href="https://www.alphadevs.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-upay-bluedark"
            >
              © alphadevs.dev
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
