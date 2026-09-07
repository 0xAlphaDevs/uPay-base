import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_HEIGHT = 420;
const MIN_HEIGHT = 300;
const MAX_HEIGHT_VH = 90;

export function CheckoutModal({
  checkoutUrl,
  sessionId,
  onClose,
}: {
  checkoutUrl: string;
  sessionId: string;
  onClose: () => void;
}) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const checkoutOrigin = new URL(checkoutUrl).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== checkoutOrigin) return;
      const data = event.data as { type?: string; sessionId?: string; height?: number } | undefined;
      if (data?.type !== "upay:resize" || data.sessionId !== sessionId || typeof data.height !== "number") return;
      setHeight(Math.max(MIN_HEIGHT, data.height));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [checkoutUrl, sessionId]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(27,18,38,.5)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "100%",
          maxHeight: `${MAX_HEIGHT_VH}vh`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(27,18,38,.34)",
        }}
      >
        <iframe
          key={sessionId}
          src={`${checkoutUrl}/checkout/${sessionId}?embed=1`}
          title="UPay checkout"
          allow="clipboard-write; publickey-credentials-get *"
          style={{
            width: "100%",
            height: Math.min(height, window.innerHeight * (MAX_HEIGHT_VH / 100)),
            border: "none",
            display: "block",
            background: "#fff",
            transition: "height 120ms ease",
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
