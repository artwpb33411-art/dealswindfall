export async function logAnalyticsEvent(payload: any) {
  try {
    await fetch("/api/analytics/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Analytics send failed", e);
  }
}
