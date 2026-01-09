"use client";

const SESSION_KEY = "dw_viewed_deals";

function getViewedDeals(): Set<number> {
  try {
    return new Set<number>(
      JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]")
    );
  } catch {
    return new Set<number>();
  }
}

function saveViewedDeals(deals: Set<number>) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([...deals]));
}

export function trackDealView(dealId: number) {
  if (!dealId) return;

  const viewed = getViewedDeals();

  if (viewed.has(dealId)) return; // ✅ dedupe per session

  viewed.add(dealId);
  saveViewedDeals(viewed);

  fetch("/api/track/deal-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deal_id: dealId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    }),
  }).catch(() => {
    // analytics must never affect UX
  });
}
