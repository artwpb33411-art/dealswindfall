import { toZonedTime, fromZonedTime, format } from "date-fns-tz";

const TZ = "America/New_York";

/**
 * Convert an EST date range (YYYY-MM-DD) to UTC ISO timestamps
 */
// lib/timezone.ts
export function estDateRangeToUtc(start: string, end: string) {
  // Treat start/end as EST calendar days
  const startUtc = new Date(`${start}T05:00:00.000Z`); // 00:00 EST
  const endUtc = new Date(`${end}T04:59:59.999Z`);
  endUtc.setUTCDate(endUtc.getUTCDate() + 1); // include full end day

  return {
    fromUtc: startUtc.toISOString(),
    toUtc: endUtc.toISOString(),
  };
}

/**
 * Default last N days in EST
 */
export function defaultEstRange(days = 7) {
  const nowEst = toZonedTime(new Date(), TZ);

  const to = format(nowEst, "yyyy-MM-dd");
  const fromDate = new Date(nowEst);
  fromDate.setDate(fromDate.getDate() - (days - 1));
  const from = format(fromDate, "yyyy-MM-dd");

  return { from, to };
}

/**
 * Format a UTC timestamp for Admin UI (EST)
 */
export function formatUtcToEst(utc: string) {
  return new Date(utc).toLocaleString("en-US", {
    timeZone: TZ,
  });
}
