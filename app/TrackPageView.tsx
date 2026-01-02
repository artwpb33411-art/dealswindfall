"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const search = window.location.search;

    // ✅ ONLY global page views live here
    trackEvent({
      event_name: "page_view",
      event_type: "view",
      page: pathname + search,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, [pathname]);

  return null;
}
