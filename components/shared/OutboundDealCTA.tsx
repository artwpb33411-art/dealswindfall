"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    ua.includes("FBAN") ||
    ua.includes("FBAV") ||
    ua.includes("Instagram") ||
    ua.includes("TikTok")
  );
}

export default function OutboundDealCTA({
  link,
  label,
  dealId,
  store,
  category,
  page,
  className,
  enableInAppOverlay = false, // ✅ SAFE DEFAULT
}: {
  link: string;
  label: string;
  dealId: number;
  store?: string | null;
  category?: string | null;
  page?: string;
  className?: string;
  enableInAppOverlay?: boolean;
}) {
  const [showOverlay, setShowOverlay] = useState(false);

  const fireOutbound = () => {
    trackEvent({
      event_name: "deal_outbound_click",
      event_type: "click",
      deal_id: dealId,
      page:
        page ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : ""),
      store: store ?? undefined,
      category: category ?? undefined,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
  };

  return (
    <>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          fireOutbound();

          if (enableInAppOverlay && isInAppBrowser()) {
            e.preventDefault();
            e.stopPropagation();
            setShowOverlay(true);
          }
        }}
        className={
          className ??
          "w-full block text-center bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
        }
      >
        {label}
      </a>

      {showOverlay && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm text-center space-y-4">
            <h3 className="text-lg font-semibold">Open this deal</h3>
            <p className="text-sm text-gray-600">
              For the best checkout experience, open this deal in your browser or app.
            </p>

            <button
              onClick={() => {
                window.location.href = link;
              }}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium"
            >
              Open in App
            </button>

            <button
              onClick={() => {
                window.open(link, "_blank");
                setShowOverlay(false);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
            >
              Open in Browser
            </button>

            <button
              onClick={() => setShowOverlay(false)}
              className="text-xs text-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
