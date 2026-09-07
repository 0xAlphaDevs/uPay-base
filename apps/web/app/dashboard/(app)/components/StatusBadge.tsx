export type PaymentStatus = "Paid" | "Pending" | "Failed";

const styles: Record<PaymentStatus, string> = {
  Paid: "bg-[#E9F6EF] text-[#1F7A4D] border-[#CFEBDC]",
  Pending: "bg-[#FBF3E6] text-[#9A6B1E] border-[#F0E2C8]",
  Failed: "bg-[#FDEAEA] text-[#B3261E] border-[#F5D0CC]",
};

const dots: Record<PaymentStatus, string> = {
  Paid: "●",
  Pending: "◔",
  Failed: "●",
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${styles[status]}`}
    >
      <span aria-hidden="true">{dots[status]}</span>
      {status}
    </span>
  );
}
