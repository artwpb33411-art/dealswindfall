"use client";
import { trackEvent } from "@/lib/trackEvent";

import Image from "next/image";

interface DealCardProps {
  title: string;
  store?: string;
  image?: string;
  oldPrice?: number | null;
  newPrice?: number | null;
  discount?: number | null;
  link?: string;
  category?: string;
  level?: string;
}

export default function DealCard({
  title,
  store,
  image,
  oldPrice,
  newPrice,
  discount,
  link,
  category,
  level,
}: DealCardProps) {
  const discountText =
    discount && discount > 0 ? `-${discount.toFixed(0)}%` : null;

  const formattedOld = oldPrice
    ? `$${oldPrice.toFixed(2)}`
    : oldPrice === 0
    ? "$0.00"
    : "";

  const formattedNew = newPrice
    ? `$${newPrice.toFixed(2)}`
    : newPrice === 0
    ? "$0.00"
    : "";

  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100">
      {/* Image */}
      <div className="w-full h-52 bg-gray-100 relative">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}

        {/* Discount badge */}
        {discountText && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
            {discountText}
          </span>
        )}

        {/* Deal level badge */}
        {level && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md">
            {level}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 line-clamp-2">{title}</h3>

        {store && (
          <p className="text-sm text-gray-500">
            🏬 <span className="font-medium">{store}</span>
          </p>
        )}

        {category && (
          <p className="text-xs text-gray-400 uppercase">{category}</p>
        )}

        {/* Price info */}
        <div className="flex items-center gap-2 mt-1">
          {formattedNew && (
            <span className="text-lg font-bold text-green-600">
              {formattedNew}
            </span>
          )}
          {formattedOld && (
            <span className="text-sm text-gray-400 line-through">
              {formattedOld}
            </span>
          )}
        </div>

        {/* Link */}
        {link && (
          <a
           href={link}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() =>
    trackEvent({
      event_name: "deal_outbound_click",
      event_type: "click",
      page: window.location.pathname,
      deal_id: link ? Number(link.split("/").pop()) : null,
      store,
      category,
      device: navigator.userAgent,
    })
  }
  className="mt-2 w-full text-center bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
>
            View Deal
          </a>
        )}
      </div>
    </div>
  );
}
