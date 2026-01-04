"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedDeals } from "@/lib/SavedDealsContext";

export default function SavedDealsPage() {
  const { savedDeals, toggleSave } = useSavedDeals();
  const deals = Object.values(savedDeals);

  if (deals.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        ❤️ You haven’t saved any deals yet.
      </div>
    );
  }

  return (
  <div className="p-4">
    <div className="mx-auto max-w-4xl space-y-4">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex gap-4 border rounded-xl p-4 bg-white items-center"
        >
          {/* Image */}
          {deal.image_link && (
            <img
              src={deal.image_link}
              alt={deal.title}
              className="w-24 h-24 object-contain rounded"
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title (clickable) */}
            <Link
              href={`/deals/${deal.id}-${deal.slug}`}
              className="font-semibold text-slate-900 hover:underline line-clamp-2"
            >
              {deal.title}
            </Link>

            {/* Store */}
            {deal.store_name && (
              <p className="text-sm text-gray-500 mt-1">
                {deal.store_name}
              </p>
            )}

            {/* Price */}
            {deal.current_price != null && (
              <p className="font-bold mt-1">
                ${deal.current_price.toFixed(2)}
              </p>
            )}

            {/* Open Deal */}
            <Link
              href={`/deals/${deal.id}-${deal.slug}`}
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              Open Deal →
            </Link>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => toggleSave(deal)}
            title="Remove from saved"
            className="p-2 rounded-full text-red-500 hover:bg-red-50"
          >
            <Heart size={20} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
    </div>
  );
}
