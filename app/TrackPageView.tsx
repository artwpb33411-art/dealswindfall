"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const userAgent = navigator.userAgent;

    // 1️⃣ Global page view
    trackEvent({
      event_name: "page_view",
      event_type: "view",
      page: pathname,
      referrer: document.referrer || null,
      user_agent: userAgent, // ✅ standardized
    });

    // 2️⃣ Deal-specific page view
    if (pathname.includes("/deals/")) {
      trackEvent({
        event_name: "deal_page_view",
        event_type: "view",
        page: pathname,
        referrer: document.referrer || null,
        user_agent: userAgent, // ✅ REQUIRED
      });
    }

  }, [pathname]);

  return null;
}
