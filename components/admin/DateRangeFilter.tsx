"use client";

/**
 * Returns today's date as YYYY-MM-DD in America/New_York
 * (UI-level EST semantics, no UTC math)
 */
function getTodayEst(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

/**
 * Returns { start, end } for last N days in EST (calendar days)
 */
function getLastNDaysEst(days: number) {
  const end = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
  );

  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));

  return {
    start: start.toLocaleDateString("en-CA"),
    end: end.toLocaleDateString("en-CA"),
  };
}

export default function DateRangeFilter({
  start,
  end,
  limit,
  onChange,
}: {
  start: string;
  end: string;
  limit: number;
  onChange: (start: string, end: string, limit: number) => void;
}) {
  const todayEst = getTodayEst();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        {/* Left: title */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Analytics Date Range
          </h2>
          <p className="text-sm text-slate-500">
            All data is shown using Eastern Time (EST/EDT)
          </p>
        </div>

        {/* Right: controls */}
        <div className="flex flex-wrap items-end gap-2">
          {/* From */}
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            From
            <input
              type="date"
              value={start}
              max={todayEst}
              onChange={(e) =>
                onChange(e.target.value, end, limit)
              }
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>

          {/* To */}
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            To
            <input
              type="date"
              value={end}
              max={todayEst}
              onChange={(e) =>
                onChange(start, e.target.value, limit)
              }
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>

          {/* Limit */}
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            Limit
            <input
              type="number"
              min={5}
              max={100}
              value={limit}
              onChange={(e) =>
                onChange(
                  start,
                  end,
                  Number(e.target.value || 20)
                )
              }
              className="h-9 w-24 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </label>

          {/* Quick ranges */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                const { start, end } = getLastNDaysEst(1);
                onChange(start, end, limit);
              }}
              className="h-9 rounded-lg border px-3 text-xs text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                const { start, end } = getLastNDaysEst(7);
                onChange(start, end, limit);
              }}
              className="h-9 rounded-lg border px-3 text-xs text-slate-700 hover:bg-slate-50"
            >
              Last 7 days
            </button>

            <button
              type="button"
              onClick={() => {
                const { start, end } = getLastNDaysEst(30);
                onChange(start, end, limit);
              }}
              className="h-9 rounded-lg border px-3 text-xs text-slate-700 hover:bg-slate-50"
            >
              Last 30 days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
