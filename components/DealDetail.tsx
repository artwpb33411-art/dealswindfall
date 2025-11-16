"use client";

import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";

export default function DealDetail({ deal }: { deal: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Couldn’t copy. Please copy manually.");
    }
  };

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a deal to view details
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-white">
      
      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 p-6 pb-28 custom-scroll">

        {/* Badges, Title, etc... everything inside here remains unchanged */}

        {deal.deal_level && (
          <div className={`self-start mb-4 px-3 py-1 rounded-full text-white text-sm font-medium ${
            deal.deal_level.includes("Flaming")
              ? "bg-red-600"
              : deal.deal_level.includes("Searing")
              ? "bg-orange-500"
              : deal.deal_level.includes("Scorching")
              ? "bg-amber-500"
              : deal.deal_level.includes("Blistering")
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-400"
          }`}>
            {deal.deal_level}
          </div>
        )}

        <h1 className="text-2xl font-semibold text-gray-800 mb-3 leading-tight">
          {deal.description || "Untitled Deal"}
        </h1>

        {deal.image_link && (
          <div className="w-full flex justify-center mb-5">
            <img
              src={deal.image_link}
              alt={deal.description}
              className="max-h-80 object-contain rounded-lg shadow-sm border"
            />
          </div>
        )}

        {deal.product_link && (
          <a
            href={deal.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold shadow transition mb-6"
          >
            View Deal
          </a>
        )}

        {deal.coupon_code && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Coupon Code:</p>
            <div className="flex items-stretch gap-2">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-400 rounded-md font-mono text-gray-800">
                {deal.coupon_code}
              </div>
              <button
                onClick={() => handleCopy(deal.coupon_code)}
                className={`px-3 py-2 rounded-md border transition ${
                  copied
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
		
		{/* 💰 Pricing Info */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {typeof deal.current_price === "number" && (
          <span className="text-3xl font-bold text-green-600">
            ${deal.current_price.toFixed(2)}
          </span>
        )}
        {typeof deal.old_price === "number" && (
          <span className="text-xl text-gray-400 line-through">
            ${deal.old_price.toFixed(2)}
          </span>
        )}
        {typeof deal.percent_diff === "number" && (
          <span className="text-sm text-red-600 font-semibold">
            (-{deal.percent_diff.toFixed(0)}%)
          </span>
        )}
      </div>
      {/* 📅 Additional Info */}
      <div className="text-sm text-gray-500 mb-8 space-y-1">
        {deal.store_name && <p>Store: {deal.store_name}</p>}
        {deal.category && <p>Category: {deal.category}</p>}
        {deal.expire_date && (
          <p>
            Expires on:{" "}
            <span className="font-medium">
              {new Date(deal.expire_date).toLocaleDateString()}
            </span>
          </p>
        )}
        {deal.published_at && (
          <p>
            Added:{" "}
            <span className="font-medium">
              {new Date(deal.published_at).toLocaleDateString()}
            </span>
          </p>
        )}
      </div>
      {/* 📝 Detailed Description */}
      {deal.notes && (
        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {deal.notes}
        </p>
      )}


        {/* Pricing, details, notes — unchanged */}
        
        <Disclaimer />

      </div>
    </div>
  );
}
