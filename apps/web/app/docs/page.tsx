import Link from "next/link";
import { CopyButton } from "./CopyButton";
import { TryLiveButton } from "./TryLiveButton";

const reactSnippet = `import { UPayButton } from 'upay-base-sdk'

<UPayButton
  apiKey="pk_test_..."
  amount={40}
/>`;

const jsSnippet = `import { UPay } from 'upay-base-sdk'

const upay = new UPay({ apiKey: 'pk_test_...' })
const session = await upay.createCheckout({ amount: 40 })
upay.openCheckout(session.id)`;

const serverSnippet = `import { UPay } from 'upay-base-sdk'

const upay = new UPay({ apiKey: process.env.UPAY_API_KEY })
const session = await upay.createCheckout({ amount: 40 })
return redirect(session.checkoutUrl)`;

const navItems = [
  { href: "#install", label: "Installation" },
  { href: "#try", label: "Try it live" },
  { href: "#react", label: "React component" },
  { href: "#js", label: "JavaScript, no React" },
  { href: "#server", label: "Server-side session" },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-upay-paper">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-12 px-6 py-14 md:grid-cols-[200px_1fr]">
        <div className="self-start md:sticky md:top-8">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[.05em] text-[#A39DAD]">
            Documentation
          </div>
          <div className="flex flex-col gap-0.5 text-[14px] font-medium">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-2 text-[#4A4458] transition-colors hover:bg-[#F0F4FF] hover:text-upay-bluedark"
              >
                {item.label}
              </a>
            ))}
            <span className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[#B3ADBC]">
              Webhooks
              <span className="rounded-[5px] border border-[#D6E2FF] bg-[#EAF0FF] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[.04em] text-[#5C7FE8]">
                Soon
              </span>
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-[32px] font-bold tracking-[-.03em] text-[#15101C] sm:text-[36px]">uPay SDK</h1>
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-[#4A4458] sm:text-[17px]">
            Accept any token on any chain and settle in USDC on Base Sepolia. Pick the integration that fits your
            stack.
          </p>

          <section id="install" className="mt-9 scroll-mt-8">
            <h2 className="text-[19px] font-semibold text-[#15101C] sm:text-[20px]">Installation</h2>
            <div className="mt-3.5 flex items-center justify-between gap-3 rounded-[11px] bg-[#1C1726] px-4 py-3.5">
              <code className="font-mono text-[14px] text-[#D8D2E2]">
                <span className="text-[#7FD6A6]">npm</span> install upay-base-sdk
              </code>
              <CopyButton text="npm install upay-base-sdk" />
            </div>
          </section>

          <section id="try" className="mt-9 scroll-mt-8">
            <h2 className="text-[19px] font-semibold text-[#15101C] sm:text-[20px]">Try it live</h2>
            <p className="mt-2 text-[15px] text-[#6B6577]">This is the real component. Click to open the checkout.</p>
            <TryLiveButton />
          </section>

          <section id="react" className="mt-9 scroll-mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-semibold text-[#15101C] sm:text-[20px]">React component</h2>
              <CopyButton text={reactSnippet} />
            </div>
            <p className="mt-2 text-[15px] text-[#6B6577]">
              The publishable key and amount are all it needs. Add <code className="rounded bg-white px-1 py-0.5 text-[13px]">settle</code> to override
              which token this button settles in — otherwise it uses whatever you set in dashboard Settings.
            </p>
            <pre className="mt-3.5 overflow-x-auto rounded-xl bg-[#1C1726] p-5 font-mono text-[13.5px] leading-[1.8] text-[#D8D2E2]">
              {reactSnippet}
            </pre>
          </section>

          <section id="js" className="mt-9 scroll-mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-semibold text-[#15101C] sm:text-[20px]">JavaScript, no React</h2>
              <CopyButton text={jsSnippet} />
            </div>
            <p className="mt-2 text-[15px] text-[#6B6577]">
              Create a session and open the checkout in a popup, from any browser JS context.
            </p>
            <pre className="mt-3.5 overflow-x-auto rounded-xl bg-[#1C1726] p-5 font-mono text-[13.5px] leading-[1.8] text-[#D8D2E2]">
              {jsSnippet}
            </pre>
          </section>

          <section id="server" className="mt-9 scroll-mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-semibold text-[#15101C] sm:text-[20px]">Server-side session</h2>
              <CopyButton text={serverSnippet} />
            </div>
            <p className="mt-2 text-[15px] text-[#6B6577]">
              Create a session server-side and redirect the customer to it — no client-side SDK needed at all.
            </p>
            <pre className="mt-3.5 overflow-x-auto rounded-xl bg-[#1C1726] p-5 font-mono text-[13.5px] leading-[1.8] text-[#D8D2E2]">
              {serverSnippet}
            </pre>
          </section>

          <div className="mt-12 border-t border-[#ECE8F1] pt-6">
            <Link href="/dashboard/api-keys" className="text-[14.5px] font-semibold text-upay-blue hover:underline">
              Get your API key →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
