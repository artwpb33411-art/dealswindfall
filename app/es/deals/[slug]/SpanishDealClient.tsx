"use client";

import { useDealViewTracker } from "@/lib/useDealViewTracker";

export default function SpanishDealClient({
  deal,
  viewsLastHour,
  children,
}: {
  deal: any;
  viewsLastHour: number;
  children: React.ReactNode;
}) {
  useDealViewTracker(deal?.id);

  return (
    <>
      {/* Optional: expose views info to children via context later */}
      {children}

      {/* Optional inline UI (only if you want it here) */}
      {viewsLastHour > 0 && (
        <p className="mt-4 text-xs text-orange-600">
          🔥 {viewsLastHour} personas vieron esta oferta en la última hora
        </p>
      )}
    </>
  );
}
