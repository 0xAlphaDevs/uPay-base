import type { CheckoutSession, UPayConfig, UPaySettle } from "./types";

// apps/web's production domain — merchants using the SDK without an
// explicit checkoutUrl rely on this resolving to a real, reachable checkout
// host. Local dev/testing isn't affected by this default: demo-store passes
// its own checkoutUrl (NEXT_PUBLIC_UPAY_CHECKOUT_URL, localhost in dev).
export const DEFAULT_CHECKOUT_URL = "https://www.upay.finance";

/** Imperative client for server-rendered or non-React integrations. */
export class UPay {
  private apiKey: string;
  private checkoutUrl: string;

  constructor(config: UPayConfig) {
    this.apiKey = config.apiKey;
    this.checkoutUrl = config.checkoutUrl ?? DEFAULT_CHECKOUT_URL;
  }

  async createCheckout(params: {
    amount: number;
    settle?: UPaySettle;
    metadata?: Record<string, unknown>;
  }): Promise<CheckoutSession> {
    const res = await fetch(`${this.checkoutUrl}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        amount: params.amount,
        // Omitted entirely when settle isn't passed, so the server falls
        // back to the merchant's dashboard-configured settlement_token.
        token: params.settle?.token,
        metadata: params.metadata,
      }),
    });
    if (!res.ok) {
      throw new Error(`UPay: failed to create checkout session (${res.status})`);
    }
    const data = await res.json();
    return { id: data.id, checkoutUrl: data.checkout_url };
  }

  openCheckout(sessionId: string) {
    if (typeof window === "undefined") {
      throw new Error("UPay.openCheckout can only be called in the browser");
    }
    window.open(`${this.checkoutUrl}/checkout/${sessionId}`, "_blank", "noopener,noreferrer");
  }
}
