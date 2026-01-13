// lib/trackEvent.ts

function getDeviceInfo() {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  const touch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  let device_type: "mobile" | "tablet" | "desktop" = "desktop";
  if (/iPad|Tablet/i.test(ua)) device_type = "tablet";
  else if (/Mobi|Android/i.test(ua)) device_type = "mobile";

  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return {
    browser,
    metadata: {
      os,
      device_type,
      screen: `${screenWidth}x${screenHeight}`,
      dpr,
      touch,
    },
  };
}

export function trackEvent(event: any) {
  try {
    // ---------- Visitor ID ----------
    let visitor_id: string | null = null;

    if (typeof window !== "undefined") {
      visitor_id = localStorage.getItem("dw_visitor_id");

      if (!visitor_id) {
        visitor_id =
          "crypto" in window && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);

        localStorage.setItem("dw_visitor_id", visitor_id);
      }
    }

    const deviceInfo = getDeviceInfo();

    const payload = {
      ...event,
      visitor_id,
      device: deviceInfo.browser ?? event.device ?? null,
      metadata: {
        ...(event.metadata || {}),
        ...(deviceInfo.metadata || {}),
      },
      created_at: new Date().toISOString(),
    };

    const body = JSON.stringify(payload);
    const url = "/api/analytics/log";

    // ✅ 1. Beacon (best for outbound clicks)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }

    // ✅ 2. Fallback fetch (non-blocking)
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // analytics must never break UX
    });

  } catch {
    // swallow all errors
  }
}
