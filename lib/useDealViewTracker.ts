"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/trackEvent";

export function useDealViewTracker(dealId?: number) {
  useEffect(() => {
    if (!dealId) return;

    const sessionKey = `dw_deal_viewed_slug_${dealId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "1");

    trackEvent({
      event_name: "deal_page_view",
      event_type: "view",
      deal_id: dealId,
      page: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, [dealId]);
}
