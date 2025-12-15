import { trackEvent } from "@/lib/trackEvent";

let timer: any = null;
let lastDealId: string | null = null;

export function initDealIntentTracker(visitorId: string) {
  const onScroll = () => {
    clearTimeout(timer);

    const deal = document.elementFromPoint(
      window.innerWidth / 2,
      window.innerHeight / 2
    )?.closest("[data-deal-id]") as HTMLElement | null;

    if (!deal) return;

    const dealId = deal.dataset.dealId;
    if (!dealId || dealId === lastDealId) return;

    timer = setTimeout(() => {
      lastDealId = dealId;

      trackEvent({
        event_name: "deal_intent",
        event_type: "engagement",
        deal_id: Number(dealId),
        page: window.location.pathname,
        visitor_id: visitorId,
        metadata: {
          intent_type: "scroll_pause",
          intent_strength: 0.7
        }
      });
    }, 700);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    clearTimeout(timer);
  };
}
