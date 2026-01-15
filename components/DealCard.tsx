"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { trackEvent } from "@/lib/trackEvent";
import {
  getRelativeTime,
  getAbsoluteLocalTime,
  getDealAgeLevel,
} from "@/lib/ui/dealTime";

interface DealCardProps {
  deal_id: number;                 // ✅ REQUIRED (source of truth)
  title: string;
  store?: string;
  image?: string;
  oldPrice?: number | null;
  newPrice?: number | null;
  discount?: number | null;
  link?: string;                   // retailer link
  category?: string;
  level?: string;
  published_at?: string;
}

export default function DealCard({
  deal_id,
  title,
  store,
  image,
  oldPrice,
  newPrice,
  discount,
  link,
  category,
  level,
  published_at,
}: DealCardProps) {
  const discountText =
    discount && discount > 0 ? `-${discount.toFixed(0)}%` : null;

  const formattedOld =
    oldPrice !== null && oldPrice !== undefined
      ? `$${oldPrice.toFixed(2)}`
      : "";

  const formattedNew =
    newPrice !== null && newPrice !== undefined
      ? `$${newPrice.toFixed(2)}`
      : "";

  const ageLevel = published_at ? getDealAgeLevel(published_at) : null;
  const relativeTime = published_at ? getRelativeTime(published_at) : null;
  const absoluteTime = published_at
    ? getAbsoluteLocalTime(published_at)
    : null;

  /**
   * Fired ONLY when user intentionally opens the deal
   * (i.e., clicks the card itself to view details in pane)
   */
  const handleDealOpen = () => {
    trackEvent({
      event_name: "deal_page_view",
      event_type: "view",
      deal_id,
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  };

  /**
   * Fired ONLY when user clicks retailer link
   */
  const handleOutboundClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.stopPropagation(); // ✅ prevent triggering deal_page_view

    trackEvent({
      event_name: "deal_outbound_click",
      event_type: "click",
      deal_id,
      page: window.location.pathname + window.location.search,
      store,
      category,
      user_agent: navigator.userAgent,
    });
  };


  function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";

  return (
    ua.includes("FBAN") ||     // Facebook
    ua.includes("FBAV") ||
    ua.includes("Instagram") ||
    ua.includes("TikTok") ||
    ua.includes("Line") ||
    ua.includes("Twitter")
  );
}
const [showBrowserOverlay, setShowBrowserOverlay] = useState(false);


  return (
   <div
  className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100 cursor-pointer"
  onClick={handleDealOpen}
>

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
        <h3 className="font-semibold text-gray-800 line-clamp-2">
          {title}
        </h3>

        {store && (
          <p className="text-sm text-gray-500">
            🏬 <span className="font-medium">{store}</span>
          </p>
        )}

        {category && (
          <p className="text-xs text-gray-400 uppercase">
            {category}
          </p>
        )}

        {/* Time info */}
        {relativeTime && (
          <p className="text-xs text-gray-500">
            🕒 {relativeTime}
            {absoluteTime && (
              <span className="ml-1 text-gray-400">
                ({absoluteTime})
              </span>
            )}
          </p>
        )}

        {/* Soft availability warning */}
        {ageLevel === "old" && (
          <p className="text-xs text-yellow-600">
            ⚠️ Older deal — availability may have changed
          </p>
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

        {/* Retailer link */}
        {link && (
          <div className="mt-2">
          <a
  href={link}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => {
    handleOutboundClick(e);

    if (isInAppBrowser()) {
      e.preventDefault();
      setShowBrowserOverlay(true);
    }
  }}
  className="w-full block text-center bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
>
  View Deal
</a>


            {/* Redirect clarity */}
            <p className="text-xs text-gray-500 mt-1 text-center">
              You’ll be redirected to {store || "the retailer"} to
              complete your purchase
            </p>

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-400 mt-1 text-center">
              Price and availability may change at any time.
            </p>
          </div>
        )}
      </div>
      {showBrowserOverlay && link && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm text-center space-y-4">
      <h3 className="text-lg font-semibold">
        Open this deal
      </h3>

      <p className="text-sm text-gray-600">
        For the best checkout experience, open this deal in your browser or app.
      </p>

      {/* Open in App (Phase 4 placeholder) */}
      <button
        onClick={() => {
          window.location.href = link;
        }}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium"
      >
        Open in App
      </button>

      {/* Open in Browser */}
      <button
        onClick={() => {
          window.open(link, "_blank");
          setShowBrowserOverlay(false);
        }}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
      >
        Open in Browser
      </button>

      {/* Continue here */}
      <button
        onClick={() => {
          window.location.href = link;
        }}
        className="text-sm text-gray-500 underline"
      >
        Continue here
      </button>
    </div>
  </div>
)}

    </div>
  );
}
