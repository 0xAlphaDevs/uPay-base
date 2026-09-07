const ICONS: Record<string, string> = {
  USDC: "/assets/usdc.svg",
  EURC: "/assets/eurc.svg",
  Arc: "/assets/arc.svg",
  "Arc Testnet": "/assets/arc.svg",
  Base: "/assets/base.svg",
  "Base Sepolia": "/assets/base.svg",
};

export function TokenIcon({
  token,
  size = 18,
  className = "",
}: {
  token: string;
  size?: number;
  className?: string;
}) {
  const src = ICONS[token];

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 rounded-full bg-[#8B8595] ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={token}
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-[6px] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
