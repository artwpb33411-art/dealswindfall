let pauseTimer: ReturnType<typeof setTimeout> | null = null;
const firedDeals = new Set<string>();

export function initDealScrollPauseTracker(visitorId?: string | null) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const dealId = el.dataset.dealId;

        if (!dealId || firedDeals.has(dealId)) return;

        if (entry.intersectionRatio >= 0.6) {
          pauseTimer = setTimeout(() => {
            firedDeals.add(dealId);

            import("./client").then(({ logAnalyticsEvent }) => {
              logAnalyticsEvent({
                event_name: "deal_intent",
                event_type: "intent",
                page: window.location.pathname,
                deal_id: Number(dealId),
                visitor_id: visitorId ?? null,
                metadata: {
                  intent_type: "scroll_pause",
                  intent_strength: "medium",
                },
              });
            });
          }, 800);
        } else {
          if (pauseTimer) {
            clearTimeout(pauseTimer);
            pauseTimer = null;
          }
        }
      });
    },
    { threshold: 0.6 }
  );

  // Observe existing deals
  const observeDeals = () => {
    document
      .querySelectorAll<HTMLElement>("[data-deal-id]")
      .forEach((el) => {
        if (!firedDeals.has(el.dataset.dealId || "")) {
          observer.observe(el);
        }
      });
  };

  observeDeals();

  // 🔥 Watch for dynamically added deals
  const mutationObserver = new MutationObserver(observeDeals);
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
    firedDeals.clear();
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  };
}
