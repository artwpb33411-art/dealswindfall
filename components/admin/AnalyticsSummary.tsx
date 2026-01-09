"use client";

export default function AnalyticsSummary({
  data,
}: {
  data: {
    unique_visitors: number;
    total_page_views: number;
    total_deal_clicks: number;
    total_outbound_clicks: number;
  };
}) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Visitors" value={data.unique_visitors} />
      <Stat label="Page Views" value={data.total_page_views} />
      <Stat label="Deal Clicks" value={data.total_deal_clicks} />
      <Stat label="Outbound Clicks" value={data.total_outbound_clicks} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}
