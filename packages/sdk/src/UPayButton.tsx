import { useEffect, useState } from "react";
import { UPay, DEFAULT_CHECKOUT_URL } from "./client";
import { CheckoutModal } from "./CheckoutModal";
import type { UPayButtonProps } from "./types";

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    background: "#2D5BFF",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    font: "600 15px Geist, system-ui, sans-serif",
    letterSpacing: "-.01em",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(45,91,255,.35), 0 8px 18px rgba(45,91,255,.26)",
  } as const,
  badge: {
    width: 18,
    height: 18,
    borderRadius: 6,
    background: "rgba(255,255,255,.22)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
  } as const,
};

export function UPayButton({
  apiKey,
  amount,
  settle,
  metadata,
  checkoutUrl,
  onPaid,
  onError,
  children,
}: UPayButtonProps) {
  const resolvedCheckoutUrl = checkoutUrl ?? DEFAULT_CHECKOUT_URL;
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const checkoutOrigin = new URL(resolvedCheckoutUrl).origin;
    // Set once "upay:paid" arrives — gives the customer a moment to see the receipt screen
    // the checkout iframe renders on its own before the modal auto-closes. Cleared if they
    // close it themselves first (the embedded "x" sends "upay:closed").
    let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== checkoutOrigin) return;
      const data = event.data as { type?: string; sessionId?: string; txHash?: string } | undefined;
      if (data?.sessionId !== sessionId) return;

      if (data.type === "upay:paid") {
        onPaid?.({ txHash: data.txHash ?? "" });
        autoCloseTimer = setTimeout(() => setSessionId(null), 5000);
      } else if (data.type === "upay:closed") {
        if (autoCloseTimer) clearTimeout(autoCloseTimer);
        setSessionId(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [sessionId, resolvedCheckoutUrl, onPaid]);

  const handleClick = async () => {
    setState("loading");
    setErrorMessage(null);
    try {
      const upay = new UPay({ apiKey, checkoutUrl: resolvedCheckoutUrl });
      const session = await upay.createCheckout({ amount, settle, metadata });
      setSessionId(session.id);
      setState("idle");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState("error");
      setErrorMessage(error.message);
      onError?.(error);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      <button style={styles.button} onClick={handleClick} disabled={state === "loading"}>
        <span style={styles.badge}>U</span>
        {children ?? (state === "loading" ? "Opening checkout…" : "Pay with UPay")}
      </button>
      {state === "error" && (
        <span style={{ font: "500 12px Geist, system-ui, sans-serif", color: "#B3261E" }}>
          {errorMessage ?? "Couldn't start checkout. Try again."}
        </span>
      )}
      {sessionId && (
        <CheckoutModal checkoutUrl={resolvedCheckoutUrl} sessionId={sessionId} onClose={() => setSessionId(null)} />
      )}
    </div>
  );
}
