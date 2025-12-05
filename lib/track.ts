export type TrackEvent = {
  event_type: string;
  deal_id?: number | null;
  page?: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string;
  ip_address?: string | null;
};

export default async function track(event: TrackEvent) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: event.event_type,
        deal_id: event.deal_id ?? null,
        page: event.page ?? window.location.pathname,
        referrer: event.referrer ?? (document.referrer || null),

        utm_source:
          event.utm_source ??
          new URLSearchParams(window.location.search).get("utm_source"),
        utm_medium:
          event.utm_medium ??
          new URLSearchParams(window.location.search).get("utm_medium"),
        utm_campaign:
          event.utm_campaign ??
          new URLSearchParams(window.location.search).get("utm_campaign"),
        user_agent: event.user_agent ?? navigator.userAgent,
        ip_address: event.ip_address ?? null,
      }),
    });
  } catch (e) {
    console.error("Track error:", e);
  }
}
