// Deterministic per-wallet identicon (blockies-style), no external dependency.
// Same address always renders the same pattern/colors.

function stringToSeed(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function next() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function WalletAvatar({ address, size = 32 }: { address: string; size?: number }) {
  const rand = seededRandom(stringToSeed(address.toLowerCase()));
  const hue = Math.floor(rand() * 360);
  const bg = `hsl(${hue}, 40%, 92%)`;
  const fg = `hsl(${(hue + 150) % 360}, 55%, 52%)`;

  const cols = 5;
  const rows = 5;
  const half = Math.ceil(cols / 2);
  const cellSize = size / cols;

  const cells = [];
  for (let row = 0; row < rows; row++) {
    const left: boolean[] = [];
    for (let col = 0; col < half; col++) {
      left.push(rand() > 0.55);
    }
    const fullRow = [...left, ...left.slice(0, cols - half).reverse()];
    for (let col = 0; col < cols; col++) {
      if (fullRow[col]) {
        cells.push(
          <rect key={`${row}-${col}`} x={col * cellSize} y={row * cellSize} width={cellSize} height={cellSize} fill={fg} />,
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-full"
      role="img"
      aria-label={`Avatar for ${address}`}
    >
      <rect width={size} height={size} fill={bg} />
      {cells}
    </svg>
  );
}
