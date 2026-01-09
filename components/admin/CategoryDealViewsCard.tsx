"use client";

type CategoryStat = {
  category: string;
  published_deals: number;
  views: number;
  clicks: number;
  ctr: number | null;
};

export default function CategoryDealViewsCard({
  rows,
}: {
  rows: CategoryStat[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          📦 Top Categories by Deal Views
        </h2>
        <p className="text-sm text-slate-500">
          Deal views, outbound clicks, and conversion rate by category.
        </p>
      </div>

      {rows.length === 0 && (
        <div className="p-4 text-sm text-slate-500">
          No category data for this range.
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Deals</th>
                <th className="px-4 py-2 text-right">Views</th>
                <th className="px-4 py-2 text-right">Clicks</th>
                <th className="px-4 py-2 text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.category}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {r.category}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {r.published_deals}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {r.views}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {r.clicks}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {r.views < 5 || r.ctr === null
                      ? "—"
                      : `${r.ctr.toFixed(1)}%`}
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
