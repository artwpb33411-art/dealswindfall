"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

/* ----------------------------------------
   In-app browser detection
---------------------------------------- */
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

/* ----------------------------------------
   Component
---------------------------------------- */
export default function OutboundDealCTA({
  link,
  label,
  dealId,
  store,
  category,
  page,
  className,
  enableInAppOverlay = false, // safe default
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
  const [showBrowserHelp, setShowBrowserHelp] = useState(false);

  /* ----------------------------------------
     Analytics
  ---------------------------------------- */
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
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : "",
    });
  };

  /* ----------------------------------------
     Primary CTA click
  ---------------------------------------- */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    fireOutbound();

    if (enableInAppOverlay && isInAppBrowser()) {
      e.preventDefault();
      e.stopPropagation();
      setShowOverlay(true);
      return;
    }

    // Normal browsers → open immediately
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Main CTA */}
      <button
        type="button"
        onClick={handleClick}
        className={
          className ??
          "w-full block text-center bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
        }
      >
        {label}
      </button>

      {/* ----------------------------------------
          Overlay (In-App Browsers Only)
      ---------------------------------------- */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm text-center space-y-4">
            <h3 className="text-lg font-semibold">
              Leaving Facebook’s browser
            </h3>

            <p className="text-sm text-gray-600">
              Facebook opens links in its own browser.  
              For saved logins, autofill, and faster checkout, we recommend opening
              this deal in your device’s browser.
            </p>

            {/* Open in browser instructions */}
            <button
              onClick={() => setShowBrowserHelp(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
            >
              Open in your browser
            </button>

            {showBrowserHelp && (
              <p className="text-xs text-gray-600 mt-2">
                <strong>iPhone:</strong> Tap ••• (top right) → Open in Safari
                <br />
                <strong>Android:</strong> Tap ••• → Open in Chrome
              </p>
            )}

            {/* Continue in Facebook */}
            <button
              onClick={() => {
                window.open(link, "_blank", "noopener,noreferrer");
                setShowOverlay(false);
                setShowBrowserHelp(false);
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium"
            >
              Continue here
            </button>

            {/* Close */}
            <button
              onClick={() => {
                setShowOverlay(false);
                setShowBrowserHelp(false);
              }}
              className="text-xs text-gray-400 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
