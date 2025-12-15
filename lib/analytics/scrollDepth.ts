const DEPTHS = [25, 50, 75, 100];
let fired = new Set<number>();

export function initScrollDepthTracker(visitorId?: string | null) {
  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const percent = Math.round((scrollTop / docHeight) * 100);

    DEPTHS.forEach((d) => {
      if (percent >= d && !fired.has(d)) {
        fired.add(d);

        import("./client").then(({ logAnalyticsEvent }) => {
          logAnalyticsEvent({
            event_name: "scroll_depth",
            event_type: "engagement",
            page: window.location.pathname,
            visitor_id: visitorId ?? null,
            metadata: { depth: d },
          });
        });
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    fired.clear();
  };
}
