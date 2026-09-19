/** 48200 → "48.2K views", 112000 → "112K views", 1120000 → "1.1M views" */
export function formatViews(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10}M views`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10}K views`;
  }
  return `${n} views`;
}
