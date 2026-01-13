"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getHolidayIcon } from "./getHolidayIcon";
//import { SeasonalEventsBar } from "./SeasonalEventsBar";

const stores = [
  { name: "Amazon", logo: "/logos/amazon.svg" },
  { name: "Walmart", logo: "/logos/walmart.png" },
  { name: "Target", logo: "/logos/target.png" },
  { name: "Home Depot", logo: "/logos/home depot.jpg" },
  { name: "Costco", logo: "/logos/costco.png" },
  { name: "Best Buy", logo: "/logos/best buy.jpg" },
  { name: "Sam's Club", logo: "/logos/sams.png" },
  { name: "Lowe's", logo: "/logos/lowes.avif" },
  { name: "Kohl's", logo: "/logos/kohls.svg" },
  { name: "Macy's", logo: "/logos/macys.svg" },
  { name: "Staples", logo: "/logos/staples.png" },
  { name: "Office Depot", logo: "/logos/office depot.svg" },
  { name: "JCPenney", logo: "/logos/jc penny.png" },
];

type StoreListProps = {
  selectedStore: string;
  onSelect: (store: string) => void;
  selectedHoliday?: string;
  onSelectHoliday?: (tag: string) => void;
  holidayEvents?: HolidayEvent[];   // ✅ Added
};
type HolidayEvent = {
  id: number;
  name: string;
  slug: string;
};


export default function StoreList({
  selectedStore,
  onSelect,
  selectedHoliday,
  onSelectHoliday,
  holidayEvents = []
}: StoreListProps) {
  const [holidayTags, setHolidayTags] = useState<HolidayEvent[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  useEffect(() => {
    const fetchActiveHolidays = async () => {
      setLoadingHolidays(true);
      try {
        const res = await fetch("/api/holiday-events?active=true");
        const data = await res.json();
        if (res.ok) {
          setHolidayTags(data || []);
        } else {
          console.error("Failed to load active holiday events:", data.error);
        }
      } catch (e) {
        console.error("Error fetching holiday events:", e);
      } finally {
        setLoadingHolidays(false);
      }
    };

    fetchActiveHolidays();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 🔔 Seasonal events section (only if there are active events) */}
     {holidayTags.length > 0 && (
  <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
    <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1">
      Seasonal events
    </p>

    <div className="flex flex-wrap gap-2">
      {holidayTags.map((event) => (
        <button
          key={event.id}
          onClick={() => onSelectHoliday?.(event.slug)}
          className={`
            px-4 py-1.5 rounded-full border shadow-sm transition 
            whitespace-nowrap text-sm 
            hover:-translate-y-1 hover:shadow-lg active:scale-95
            ${selectedHoliday === event.slug
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
            }
          `}
        >
          <span className="mr-1">{getHolidayIcon(event.name)}</span>
          {event.name}
        </button>
      ))}
    </div>
  </div>
)}


      {/* Stores list */}
      <div className="bg-white border-r border-gray-200 h-full overflow-y-auto p-3">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Stores</h3>

        <ul className="space-y-2">
          {stores.map((store) => (
            <li
              key={store.name}
              onClick={() => onSelect(store.name)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                selectedStore === store.name
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={store.logo}
                  alt={store.name}
                  fill
                  sizes="48px"
                  className="object-contain rounded-md bg-white p-1 border shadow-sm"
                />
              </div>
              <span className="truncate text-base">{store.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
