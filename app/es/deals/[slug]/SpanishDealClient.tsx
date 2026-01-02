"use client";

import { useDealViewTracker } from "@/lib/useDealViewTracker";

export default function SpanishDealClient({
  deal,
  children,
}: {
  deal: any;
  children: React.ReactNode;
}) {
  useDealViewTracker(deal?.id);
  return <>{children}</>;
}
