// lib/trackEvent.ts
export function trackEvent(event: any) {
  try {
    // Unique visitor tracking via localStorage
    let visitor_id = null;

    if (typeof window !== "undefined") {
      visitor_id = localStorage.getItem("dw_visitor_id");
      if (!visitor_id) {
        if ("crypto" in window && "randomUUID" in crypto) {
          visitor_id = crypto.randomUUID();
        } else {
          visitor_id = Math.random().toString(36).slice(2);
        }
        localStorage.setItem("dw_visitor_id", visitor_id);
      }
    }

    fetch("/api/analytics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        visitor_id,
      }),
    });
  } catch (e) {
    console.error("Tracking error:", e);
  }
}
