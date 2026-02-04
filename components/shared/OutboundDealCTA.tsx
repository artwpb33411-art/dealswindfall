"use client";

import { trackEvent } from "@/lib/trackEvent";

export default function OutboundDealCTA({
  link,
  label,
  dealId,
  store,
  category,
  page,
  className,
}: {
  link: string;
  label: string;
  dealId: number;
  store?: string | null;
  category?: string | null;
  page?: string;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent({
            event_name: "deal_outbound_click",
            event_type: "click",
            deal_id: dealId,
            page:
              page ??
              (typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : ""),
            store: store ?? undefined,
            category: category ?? undefined,
            user_agent:
              typeof navigator !== "undefined" ? navigator.userAgent : "",
          })
        }
        className={
          className ??
          "w-full h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
        }
      >
        {label}
      </a>

    
    </div>
  );
}
