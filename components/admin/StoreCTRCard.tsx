"use client";

type StoreStat = {
  store_name: string;
  published_deals: number;
  views: number;
  clicks: number;
  ctr: number | null;
};

export default function StoreCTRCard({
  items,
}: {
  items: StoreStat[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          🏬 Store Performance
        </h2>
        <p className="text-sm text-slate-500">
          Views, outbound clicks, and conversion rate by store.
        </p>
      </div>

      {items.length === 0 && (
        <div className="p-4 text-sm text-slate-500">
          No store data for this range.
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Store</th>
                <th className="px-4 py-2 text-right">Deals</th>
                <th className="px-4 py-2 text-right">Views</th>
                <th className="px-4 py-2 text-right">Clicks</th>
                <th className="px-4 py-2 text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={s.store_name} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">
                    {s.store_name}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {s.published_deals}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {s.views}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {s.clicks}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {s.views < 5 || s.ctr === null
                      ? "—"
                      : `${s.ctr.toFixed(1)}%`}
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
