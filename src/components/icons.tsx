/** Small authored icon set — one stroke weight (1.6) everywhere. */
export function Mark({ kind, size = 12 }: { kind: "ok" | "fail" | "warn"; size?: number }) {
  if (kind === "ok")
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
        <path d="M2.2 6.3l2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "fail")
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <path d="M6 2.2v4.6M6 9.2v.1" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Arrow({ dir = "right", size = 14 }: { dir?: "right" | "down" | "up-right"; size?: number }) {
  const d =
    dir === "down" ? "M7 2.5v9m0 0L3 7.5m4 4l4-4" : dir === "up-right" ? "M4 10l6-6m0 0H5m5 0v5" : "M2.5 7h9m0 0L7.5 3m4 4l-4 4";
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bell({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
      <path d="M3.5 9.5V6.2a3.5 3.5 0 0 1 7 0v3.3l1 1.2h-9l1-1.2zM5.8 12a1.3 1.3 0 0 0 2.4 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
