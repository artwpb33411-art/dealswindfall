"use client";

type TechStats = {
  device_types: Record<string, number>;
  operating_systems: Record<string, number>;
  browsers: Record<string, number>;
  screen_sizes: Record<string, number>;
};

export default function AdminTechStats({
  data,
}: {
  data: TechStats;
}) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TechCard title="Device Types" data={data.device_types} />
      <TechCard title="Operating Systems" data={data.operating_systems} />
      <TechCard title="Browsers" data={data.browsers} />
      <TechCard title="Screen Sizes" data={data.screen_sizes} />
    </div>
  );
}

function TechCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const sorted = Object.entries(data || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {title}
      </h3>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(([key, count]) => (
            <li
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600 truncate">
                {key}
              </span>
              <span className="font-medium text-gray-900">
                {count.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
