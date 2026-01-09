"use client";

import { Heart } from "lucide-react";
import { useSavedDeals } from "@/lib/SavedDealsContext";

export default function SaveDealButton({ deal }: { deal: any }) {
  const { isSaved, toggleSave } = useSavedDeals();
  const saved = isSaved(deal.id);

  return (

    
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleSave({
          id: deal.id,
          title: deal.description,
          image_link: deal.image_link,
          current_price: deal.current_price,
          old_price: deal.old_price,
          store_name: deal.store_name,
          slug: deal.slug,
        });
      }}
      title={saved ? "Remove from saved" : "Save for later"}
      className={`p-2 rounded-full transition
        ${saved ? "text-red-500" : "text-gray-400 hover:text-red-400"}
      `}
    >
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
