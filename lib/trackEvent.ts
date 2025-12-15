// lib/trackEvent.ts

// lib/trackEvent.ts

function getTechMeta() {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent.toLowerCase();

  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("mac os")) os = "MacOS";

  let device_type = "desktop";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
    device_type = "mobile";

  return {
    os,
    device_type,
    screen: `${window.screen.width}x${window.screen.height}`,
    dpr: window.devicePixelRatio || 1,
    touch: "ontouchstart" in window,
  };
}



function getDeviceInfo() {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent;

  // ---------- Screen ----------
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  // ---------- Touch ----------
  const touch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // ---------- Device Type ----------
  let device_type: "mobile" | "tablet" | "desktop" = "desktop";
  if (/iPad|Tablet/i.test(ua)) device_type = "tablet";
  else if (/Mobi|Android/i.test(ua)) device_type = "mobile";

  // ---------- OS ----------
  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  // ---------- Browser ----------
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

    fetch("/api/analytics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,

        visitor_id,

        // Human-readable browser name
        device: deviceInfo.browser ?? event.device ?? null,

        // Merge metadata safely
        metadata: {
          ...(event.metadata || {}),
          ...(deviceInfo.metadata || {}),
        },
      }),
    });
  } catch (e) {
    console.error("Tracking error:", e);
  }
}
