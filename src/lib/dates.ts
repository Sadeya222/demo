/** ISO 8601 duration (PT1H2M3S) → total seconds. */
export function iso8601DurationToSeconds(d: string): number {
  const m = String(d).match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return (+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0));
}

/** "PT1H2M3S" → "1:02:03"; "PT8M45S" → "8:45" (thumbnail badge format). */
export function durationBadge(d: string): string {
  const total = iso8601DurationToSeconds(d);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Human relative label: "today", "yesterday", "3 days ago", "2 months ago"… */
export function relativeDate(d: Date, now: Date = new Date()): string {
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (diff < 3600) return 'today';
  if (diff < 86_400) return 'yesterday';
  const days = Math.floor(diff / 86_400);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/** "Sep 12, 2026" — UTC so the date never shifts by timezone. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
