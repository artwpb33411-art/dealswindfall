"use client";

import { getHolidayIcon } from "./getHolidayIcon";

export default function SeasonalEventsBar({ events, onSelect }: any) {
  if (!events || events.length === 0) return null;

  return (
    <div className="w-full mb-4">
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {events.map((e: any) => (
          <button
            key={e.slug}
            onClick={() => onSelect(e.slug)}
            className="
              px-4 py-2 rounded-full 
              bg-white 
              shadow-sm 
              hover:shadow-lg 
              hover:-translate-y-1 
              active:scale-95 
              transition 
              whitespace-nowrap 
              border border-gray-200
            "
          >
            <span className="mr-1">{getHolidayIcon(e.name)}</span>
            <span className="font-medium text-gray-700">{e.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
