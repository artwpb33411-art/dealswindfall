"use client";

type TopOutboundDeal = {
  deal_id: number;
  clicks: number;
  description: string | null;
  store_name: string | null;
  category: string | null;
  internal_url: string;
};

export default function TopOutboundDeals({
  deals,
}: {
  deals: TopOutboundDeal[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          🛒 Top Outbound Clicked Deals
        </h2>
        <p className="text-sm text-slate-500">
          Deals users clicked to visit the retailer.
        </p>
      </div>

      {deals.length === 0 && (
        <div className="p-4 text-sm text-slate-500">
          No outbound clicks found for this range.
        </div>
      )}

      {deals.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Deal</th>
                <th className="px-4 py-2 text-left">Store</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d, idx) => (
                <tr key={d.deal_id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2">
                    <a
                      href={d.internal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {d.description || `Deal #${d.deal_id}`}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    {d.store_name || "—"}
                  </td>
                  <td className="px-4 py-2">
                    {d.category || "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {d.clicks.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
