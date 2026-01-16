"use client";

import { getDealAgeLevel } from "@/lib/ui/dealTime";

export default function DealAgeWarning({
  publishedAt,
  className = "text-amber-600",
}: {
  publishedAt?: string | null;
  className?: string;
}) {
  if (!publishedAt) return null;
  const ageLevel = getDealAgeLevel(publishedAt);
  if (ageLevel !== "old") return null;

  return (
    <p className={className}>
      ⚠️ Older deal — availability and price may have changed
    </p>
  );
}
