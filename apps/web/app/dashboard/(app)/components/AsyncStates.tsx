export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-[15px] font-medium text-upay-ink">{title}</p>
      <p className="max-w-[320px] text-[13.5px] text-[#8B8595]">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 rounded-lg bg-upay-blue px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-upay-bluedark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center" role="alert">
      <p className="text-[15px] font-medium text-[#B3261E]">Something went wrong</p>
      <p className="max-w-[320px] text-[13.5px] text-[#8B8595]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg border border-[#EFEAE0] bg-white px-4 py-2 text-[13.5px] font-medium text-upay-ink transition-colors hover:bg-[#F9F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-upay-blue focus-visible:ring-offset-2"
      >
        Retry
      </button>
    </div>
  );
}
