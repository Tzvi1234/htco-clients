/** The demo's star-map print thumbnail: a dark poster with a ring of stars on the raised ground. */
export function StarMapThumb({ size = 48 }: { size?: number }) {
  const stars = [
    [20, 16],
    [27, 18],
    [24, 23],
    [19, 22],
    [29, 24],
    [22, 19],
  ] as const;
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width={size} height={size}>
      <rect width="48" height="48" fill="var(--bg-raised)" />
      <rect x="12" y="6" width="24" height="36" rx="1" fill="var(--illustration-ink)" />
      <circle
        cx="24"
        cy="20"
        r="9"
        fill="none"
        stroke="var(--illustration-paper)"
        strokeWidth=".5"
        opacity=".7"
      />
      {stars.map(([x, y]) => (
        <circle
          key={`${String(x)}-${String(y)}`}
          cx={x}
          cy={y}
          r=".8"
          fill="var(--illustration-paper)"
        />
      ))}
      <rect x="17" y="33" width="14" height="1.2" fill="var(--illustration-paper)" opacity=".7" />
      <rect x="19" y="36" width="10" height=".8" fill="var(--illustration-paper)" opacity=".5" />
    </svg>
  );
}
