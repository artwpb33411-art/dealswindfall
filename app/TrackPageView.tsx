"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // 1️⃣ Global page view (keep for analytics)
    trackEvent({
      event_name: "page_view",
      event_type: "view",
      page: pathname,
      referrer: document.referrer || null,
      device: navigator.userAgent,
    });

    // 2️⃣ Deal-specific page view (NEW, honest signal)
    if (pathname.includes("/deals/")) {
      trackEvent({
        event_name: "deal_page_view",
        event_type: "view",
        page: pathname,
        deal_slug: pathname.split("/deals/")[1] || null,
        referrer: document.referrer || null,
      });
    }

  }, [pathname]);

  return null;
}
