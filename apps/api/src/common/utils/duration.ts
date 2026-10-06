const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

export function parseDurationToSeconds(value: string | undefined, fallback = 900): number {
  if (!value) {
    return fallback;
  }
  const match = /^(\d+)(s|m|h|d)$/i.exec(value.trim());
  if (!match) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  return amount * (UNIT_SECONDS[unit] ?? 1);
}
