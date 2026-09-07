"use client";

import { useAppKitState } from "@reown/appkit/react";
import { useEffect, useRef, type ReactNode } from "react";

// The AppKit wallet-connect modal renders outside this component's subtree (appended
// directly to the iframe's document), so the ResizeObserver below never sees it grow —
// without this floor, the iframe stays sized to the checkout card and AppKit's modal
// gets clipped/scrollable inside it once it opens.
const APPKIT_MODAL_MIN_HEIGHT = 640;

export function ResizeReporter({
  sessionId,
  className,
  children,
}: {
  sessionId: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { open: appKitOpen } = useAppKitState();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const report = () => {
      const height = Math.max(el.offsetHeight, appKitOpen ? APPKIT_MODAL_MIN_HEIGHT : 0);
      window.parent.postMessage({ type: "upay:resize", sessionId, height }, "*");
    };

    const observer = new ResizeObserver(report);
    observer.observe(el);
    report();

    return () => observer.disconnect();
  }, [sessionId, appKitOpen]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
