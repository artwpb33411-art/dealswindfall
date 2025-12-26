// lib/ui/dealTime.ts

export type DealAgeLevel = "fresh" | "aging" | "old";

export function getDealAgeLevel(publishedAt: string | Date): DealAgeLevel {
  const published = new Date(publishedAt).getTime();
  const now = Date.now();
  const diffHours = (now - published) / (1000 * 60 * 60);

  if (diffHours < 12) return "fresh";
  if (diffHours < 24) return "aging";
  return "old";
}

export function getRelativeTime(publishedAt: string | Date): string {
  const published = new Date(publishedAt).getTime();
  const now = Date.now();
  const diffSeconds = Math.floor((now - published) / 1000);

  if (diffSeconds < 60) return "Posted just now";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `Posted ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Posted ${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `Posted ${days} day${days > 1 ? "s" : ""} ago`;
}

export function getAbsoluteLocalTime(publishedAt: string | Date): string {
  const date = new Date(publishedAt);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
