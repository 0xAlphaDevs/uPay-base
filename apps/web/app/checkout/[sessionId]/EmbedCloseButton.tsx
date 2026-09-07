"use client";

export function EmbedCloseButton({ sessionId }: { sessionId: string }) {
  return (
    <button
      type="button"
      onClick={() => window.parent.postMessage({ type: "upay:closed", sessionId }, "*")}
      aria-label="Close checkout"
      className="rounded-md p-1 text-[#B3ADBC] transition-colors hover:bg-[#F4F2F7] hover:text-upay-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
    >
      ×
    </button>
  );
}
