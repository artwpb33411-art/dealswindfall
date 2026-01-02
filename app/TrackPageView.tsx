"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const userAgent = navigator.userAgent;
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const dealIdFromQuery = params.get("deal");

    // 1️⃣ Global page view (always)
    trackEvent({
      event_name: "page_view",
      event_type: "view",
      page: pathname + search,
      referrer: document.referrer || null,
      user_agent: userAgent,
    });

    // 2️⃣ Normalized deal page view (ONE signal only)
    let dealId: number | null = null;

    // Case A: internal navigation (?deal=ID)
    if (dealIdFromQuery && !Number.isNaN(Number(dealIdFromQuery))) {
      dealId = Number(dealIdFromQuery);
    }

    // Case B: SEO / social slug (/deals/ID-slug)
    else if (pathname.includes("/deals/")) {
      const slugPart = pathname.split("/deals/")[1];
      const parsed = Number(slugPart?.split("-")[0]);
      if (!Number.isNaN(parsed)) {
        dealId = parsed;
      }
    }

    if (dealId !== null) {
      trackEvent({
        event_name: "deal_page_view",
        event_type: "view",
        page: pathname + search,
        deal_id: dealId,
        referrer: document.referrer || null,
        user_agent: userAgent,
      });
    }

  }, [pathname]);

  return null;
}
