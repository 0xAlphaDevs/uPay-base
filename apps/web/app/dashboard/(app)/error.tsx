"use client";

import { ErrorState } from "./components/AsyncStates";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-[14px] border border-[#ECE8F1] bg-white">
      <ErrorState message="We couldn't load this page. Check your connection and try again." onRetry={reset} />
    </div>
  );
}
