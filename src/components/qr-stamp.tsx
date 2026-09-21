function cellsFrom(token: string) {
  const size = 21;
  const bits: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < size * size; i++) {
    h ^= i + 1;
    h = Math.imul(h, 16777619);
    bits.push((h >>> 0) % 3 !== 0);
  }
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const on = i === 0 || j === 0 || i === 6 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5);
      bits[i * size + j] = on;
      bits[i * size + (size - 7 + j)] = on;
      bits[(size - 7 + i) * size + j] = on;
    }
  }
  return { size, bits };
}

export function QrStamp({ token }: { token: string }) {
  const { size, bits } = cellsFrom(token);
  const cell = 10;
  const pad = 12;
  const dim = size * cell + pad * 2;
  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      className="size-56 rounded-[var(--radius-md)] bg-fg"
      role="img"
      aria-label="Redemption token pattern"
    >
      {bits.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={pad + (i % size) * cell}
            y={pad + Math.floor(i / size) * cell}
            width={cell - 1}
            height={cell - 1}
            fill="#08110d"
          />
        ) : null,
      )}
    </svg>
  );
}
