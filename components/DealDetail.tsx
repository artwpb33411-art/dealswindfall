"use client";
import { trackEvent } from "@/lib/trackEvent";
import {
  getRelativeTime,
  getAbsoluteLocalTime,
  getDealAgeLevel,
} from "@/lib/ui/dealTime";

import { useState, useEffect } from "react";
import Disclaimer from "@/components/Disclaimer";
import { createClient } from "@supabase/supabase-js";
import { useLangStore } from "@/lib/languageStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DealDetail({ deal }: { deal: any }) {
  /* ---------------------------------------------------------
     🔹 ALL HOOKS MUST BE AT THE TOP (React Rules of Hooks)
  --------------------------------------------------------- */
  const { lang, hydrated, hydrate } = useLangStore();
  const [copied, setCopied] = useState(false);
  const [relatedLinks, setRelatedLinks] = useState<any[]>([]);

  // hydrate language store
  useEffect(() => {
    hydrate();
  }, []);

  // Load related links
  useEffect(() => {
    const fetchRelated = async () => {
      if (!deal?.id) {
        setRelatedLinks([]);
        return;
      }

      const { data, error } = await supabase
        .from("deal_related_links")
        .select("id, url, title")
        .eq("deal_id", deal.id)
        .order("id", { ascending: true });

      if (!error && data) {
        setRelatedLinks(data);
      }
    };

    fetchRelated();
  }, [deal?.id]);

  // PREVENT hydration mismatch
  if (!hydrated) return null;

  // PREVENT crash on null deal
  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        {lang === "en"
          ? "Select a deal to view details"
          : "Seleccione una oferta para ver los detalles"}
      </div>
    );
  }

  /* ---------------------------------------------------------
     🔹 Language-specific UI content
  --------------------------------------------------------- */
  const title = lang === "en" ? deal.description : deal.description_es;
  const notes = lang === "en" ? deal.notes : deal.notes_es;
  const viewDealText = lang === "en" ? "View Deal" : "Ver Oferta";
  const couponLabel = lang === "en" ? "Coupon Code:" : "Código de Cupón:";
  const copiedText = lang === "en" ? "Copied!" : "¡Copiado!";
  const copyText = lang === "en" ? "Copy" : "Copiar";
  const expiresOn = lang === "en" ? "Expires on" : "Expira el";
  const addedOn = lang === "en" ? "Added" : "Agregado";
  const otherDeals = lang === "en" ? "Other Related Deals" : "Otras Ofertas Relacionadas";
const publishedAt = deal?.published_at ?? null;

const relativeTime = publishedAt
  ? getRelativeTime(publishedAt)
  : null;

const absoluteTime = publishedAt
  ? getAbsoluteLocalTime(publishedAt)
  : null;

const ageLevel = publishedAt
  ? getDealAgeLevel(publishedAt)
  : null;

  /* ---------------------------------------------------------
     🔹 UI
  --------------------------------------------------------- */
  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-white">
      <div className="overflow-y-auto flex-1 p-6 pb-28 custom-scroll">
        
        {/* Heat level */}
        {deal.deal_level && (
          <div
            className={`self-start mb-4 px-3 py-1 rounded-full text-white text-sm font-medium ${
              deal.deal_level.includes("Flaming")
                ? "bg-red-600"
                : deal.deal_level.includes("Searing")
                ? "bg-orange-500"
                : deal.deal_level.includes("Scorching")
                ? "bg-amber-500"
                : deal.deal_level.includes("Blistering")
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-400"
            }`}
          >
            {deal.deal_level}
          </div>
        )}

        {/* Title */}
       <h1 className="text-xl font-semibold text-slate-900 leading-snug mb-4">

          {title || "Untitled Deal"}
        </h1>

        {/* Image */}
        {deal.image_link && (
          <div className="w-full flex justify-center mb-5">
            <img
              src={deal.image_link}
              alt={title}
            className="max-h-72 object-contain rounded-xl border bg-white"

            />
          </div>
        )}

        {/* Button */}
{deal.product_link && (
  <div className="mb-4 space-y-1">

    <a
      href={deal.product_link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackEvent({
          event_name: "deal_outbound_click",
          event_type: "click",
          page: window.location.pathname,
          deal_id: deal.id,
          store: deal.store_name,
          category: deal.category,
          device: navigator.userAgent,
        })
      }
className="w-full h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition active:scale-[0.98]"

    >
      {viewDealText}
    </a>

    {deal.store_name && (
    <p className="text-xs text-slate-400 mt-1">

        You’ll be redirected to {deal.store_name} to complete your purchase
      </p>
    )}
  </div>
)}


        {/* Coupon Code */}
        {deal.coupon_code && (
         <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">

           <p className="text-sm text-amber-700 mb-2 font-medium">
  {couponLabel}
</p>


            <div className="flex items-stretch gap-2">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-400 rounded-md font-mono text-gray-800">
                {deal.coupon_code}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(deal.coupon_code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className={`px-3 py-2 rounded-md border transition ${
                  copied
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {copied ? copiedText : copyText}
              </button>
            </div>
          </div>
        )}

        {/* Prices */}
      <div className="flex items-baseline gap-3 mb-3 justify-center sm:justify-start">

  {typeof deal.current_price === "number" && (
    <span className="text-3xl font-bold text-green-600">
      ${deal.current_price.toFixed(2)}
    </span>
  )}

  {typeof deal.old_price === "number" && (
    <span className="text-base line-through text-slate-400">
      ${deal.old_price.toFixed(2)}
    </span>
  )}

  {typeof deal.percent_diff === "number" && (
    <span className="text-sm font-semibold text-red-600">
      -{deal.percent_diff.toFixed(0)}%
    </span>
  )}
</div>

{relativeTime && (
  <div className="text-sm text-slate-500 space-y-1 mb-4">
    <p>
      {addedOn}: <span className="font-medium">{relativeTime}</span>
      {absoluteTime && (
        <span className="ml-1 text-slate-400">({absoluteTime})</span>
      )}
    </p>

    {ageLevel === "old" && (
      <p className="text-amber-600">
        ⚠️ Older deal — availability may have changed
      </p>
    )}
  </div>
)}

        {/* Additional Info */}
       <div className="text-sm text-slate-500 space-y-1 mb-6">

          {deal.store_name && <p>Store: {deal.store_name}</p>}
          {deal.category && <p>Category: {deal.category}</p>}
          {deal.expire_date && (
            <p>
              {expiresOn}:{" "}
              <span className="font-medium">
                {new Date(deal.expire_date).toLocaleDateString()}
              </span>
            </p>
          )}
   
        </div>

        {/* Notes */}
        {notes && (
        <div className="text-sm leading-relaxed text-slate-700 mb-6 whitespace-pre-line">

            {notes.replace(/https?:\/\/[^\s]+/g, "").trim()}
          </div>
        )}

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
            <h3 className="font-semibold text-lg mb-3">{otherDeals}</h3>
            <ul className="space-y-2">
              {relatedLinks.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {item.title || item.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}
