export default async function track(event_type, deal_id = null) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type,
        deal_id,
        page: window.location.pathname,
        referrer: document.referrer || null,
        utm_source: new URLSearchParams(window.location.search).get("utm_source"),
        utm_medium: new URLSearchParams(window.location.search).get("utm_medium"),
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        user_agent: navigator.userAgent,
        ip_address: null,
      }),
    });
  } catch (e) {
    console.error("Track error:", e);
  }
}
