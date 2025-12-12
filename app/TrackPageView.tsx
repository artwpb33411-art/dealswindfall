"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/trackEvent";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    trackEvent({
      event_name: "page_view",
      event_type: "view",
      page: pathname,
      referrer: document.referrer || null,
      device: navigator.userAgent,
    });

  }, [pathname]);

  return null;
}
