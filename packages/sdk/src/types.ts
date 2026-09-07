import type { ReactNode } from "react";

export type SettleToken = "USDC" | "EURC";

export interface UPaySettle {
  token: SettleToken;
  chain: "base";
}

export interface UPayButtonProps {
  /** Publishable API key, e.g. pk_test_... (session creation only). */
  apiKey: string;
  amount: number;
  /**
   * Force a specific settlement token/chain for this button, overriding
   * whatever the merchant configured in their dashboard Settings. Omit this
   * to let the merchant's dashboard setting decide instead.
   */
  settle?: UPaySettle;
  metadata?: Record<string, unknown>;
  /** Base URL of the hosted checkout app. Defaults to https://tryupay.xyz. */
  checkoutUrl?: string;
  onPaid?: (payment: { txHash: string }) => void;
  onError?: (err: Error) => void;
  children?: ReactNode;
}

export interface UPayConfig {
  apiKey: string;
  checkoutUrl?: string;
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
}
