"use client";
import { STORE_ICONS } from "@/lib/storeIcons";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

import TelegramCTA from "@/components/shared/TelegramCTA";
import ShareDealButton from "@/components/shared/ShareDealButton";
import Disclaimer from "@/components/Disclaimer";

import SaveDealButton from "@/components/SaveDealButton";
import {
  getRelativeTime,
  getAbsoluteLocalTime,
  getDealAgeLevel,
} from "@/lib/ui/dealTime";
import { useLangStore } from "@/lib/languageStore";

/* ---------------------------------------------------------
   🔹 Types (UI Contract)
--------------------------------------------------------- */

interface DealDetailProps {
  deal: {
    id: number;
    slug?: string;

    description?: string;
    description_es?: string;
    notes?: string;
    notes_es?: string;

    current_price?: number | null;
    old_price?: number | null;
    percent_diff?: number | null;

    product_link?: string | null;
    image_link?: string | null;

    store_name?: string | null;
    category?: string | null;

    coupon_code?: string | null;

    published_at?: string | null;
    expire_date?: string | null;

    deal_level?: string | null;
  };

  /** Optional, display-only */
  viewsLastHour?: number;

  /** Optional, display-only (future-proof) */
  relatedLinks?: {
    id: number;
    url: string;
    title?: string | null;
  }[];
}

/*
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
*/
export default function DealDetail({
  deal,
  viewsLastHour,
}: DealDetailProps) {


 

  /* ---------------------------------------------------------
     🔹 Hooks
  --------------------------------------------------------- */
  const { lang, hydrated } = useLangStore();
  const [copied, setCopied] = useState(false);
  const [relatedLinks, setRelatedLinks] = useState<any[]>([]);
 
   
  /* ---------------------------------------------------------
     🔹 Load related links
  --------------------------------------------------------- */
 /* useEffect(() => {
    if (!deal?.id) return;

    supabase
      .from("deal_related_links")
      .select("id, url, title")
      .eq("deal_id", deal.id)
      .order("id", { ascending: true })
      .then(({ data }) => {
        setRelatedLinks(data ?? []);
      });
  }, [deal?.id]);
*/
  if (!hydrated) return null;

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
     🔹 Language-specific content
  --------------------------------------------------------- */
  const title = lang === "en" ? deal.description : deal.description_es;
  const notes = lang === "en" ? deal.notes : deal.notes_es;
  const viewDealText = lang === "en" ? "View Deal" : "Ver Oferta";
  const couponLabel = lang === "en" ? "Coupon Code:" : "Código de Cupón:";
  const copiedText = lang === "en" ? "Copied!" : "¡Copiado!";
  const copyText = lang === "en" ? "Copy" : "Copiar";
  const expiresOn = lang === "en" ? "Expires on" : "Expira el";
  const addedOn = lang === "en" ? "Added" : "Agregado";
const otherDeals =
  lang === "en" ? "Other Related Deals" : "Otras Ofertas Relacionadas";
  const publishedAt = deal.published_at ?? null;
  const relativeTime = publishedAt ? getRelativeTime(publishedAt) : null;
  const absoluteTime = publishedAt
    ? getAbsoluteLocalTime(publishedAt)
    : null;
  const ageLevel = publishedAt ? getDealAgeLevel(publishedAt) : null;
const hasValidDiscount =
  deal.old_price != null &&
  deal.old_price > 0 &&
  deal.current_price != null &&
  deal.old_price > deal.current_price;

  /* ---------------------------------------------------------
     🔹 UI
  --------------------------------------------------------- */
  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-white">
      <div className="overflow-y-auto flex-1 pt-4 px-6 pb-24 custom-scroll">

  <div className="flex items-center justify-between mb-3">
  {/* LEFT: Views (future-ready) */}
  <div className="text-xs text-slate-500">
    {/* 👁 124 views */}
  </div>

  {/* RIGHT: Heat + Share */}
  <div className="flex items-center gap-2">
    {deal.deal_level && (
      <div
        title={deal.deal_level}
        className="flex items-center gap-1 px-2 py-1 rounded-full
                   bg-orange-50 border border-orange-200
                   text-lg shadow-sm"
      >
        {Array.from({
          length: deal.deal_level.includes("Flaming")
            ? 4
            : deal.deal_level.includes("Searing")
            ? 3
            : deal.deal_level.includes("Scorching")
            ? 2
            : 1,
        }).map((_, i) => (
          <span key={i} className="leading-none">🔥</span>
        ))}
      </div>
    )}
 <div className="flex items-center gap-2">
<SaveDealButton deal={deal} />

    <ShareDealButton
      title={`${title} – $${deal.current_price}`}
      url={`https://www.dealswindfall.com/deals/${deal.id}-${deal.slug}`}
    />
    </div>
  </div>
</div>

{/* TITLE */}
<h1 className="text-xl md:text-2xl font-bold text-slate-900 text-center leading-snug mb-4">
  {title || "Untitled Deal"}
</h1>

{/* Views last hour */}
{typeof viewsLastHour === "number" && viewsLastHour > 0 && (
  <p className="text-xs text-orange-600 mb-4 text-center">
    🔥 {viewsLastHour} people viewed this deal in the last hour
  </p>
)}

		 {/* Image */}
        {deal.image_link && (
          <div className="flex justify-center mb-4">
            <img
              src={deal.image_link}
              alt={title}
              className="max-h-72 object-contain rounded-xl border bg-white"
            />
          </div>
        )}

        {/* View Deal Button */}
        {deal.product_link && (
          <div className="mb-4 space-y-1 max-w-xl mx-auto">

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
      user_agent: navigator.userAgent,
    })
  }
  className="w-full h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
>
  {viewDealText}
</a>




            {deal.store_name && (
              <p className="text-xs text-slate-400">
                You’ll be redirected to {deal.store_name} to complete your purchase
              </p>
            )}
          </div>
        )}



        {/* rest of your UI stays unchanged */}
      
		  {deal.coupon_code && (
  <div className="flex items-center gap-3 mb-4 text-sm">
    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
      Coupon
    </span>

    <span className="px-3 py-1 rounded border font-mono bg-white">
      {deal.coupon_code}
    </span>

   <button
  onClick={() => {
    if (!deal.coupon_code) return;

    navigator.clipboard.writeText(deal.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }}
  className="px-3 py-1 rounded border text-sm hover:bg-slate-50"
>
  {copied ? copiedText : copyText}
</button>

  </div>
)}


      {/* Prices */}
<div className="flex items-baseline gap-3 mb-3">
  {deal.current_price != null && (
    <span className="text-3xl font-bold text-green-600">
      ${deal.current_price.toFixed(2)}
    </span>
  )}

  {hasValidDiscount && (
    <>
      <span className="line-through text-slate-400">
        ${deal.old_price!.toFixed(2)}
      </span>

      {deal.percent_diff != null && (
        <span className="text-red-600 font-semibold">
          -{deal.percent_diff.toFixed(0)}%
        </span>
      )}
    </>
  )}
</div>


       <div className="text-sm text-slate-500 space-y-0.5 mb-6">
  {/* Added time */}
  {relativeTime && (
    <p>
      {addedOn}: {relativeTime}
      {absoluteTime && (
        <span className="ml-1 text-slate-400">
          ({absoluteTime})
        </span>
      )}
    </p>
  )}

  {/* Store */}
 {deal.store_name && (
  <div className="flex items-center gap-2">
    {STORE_ICONS[deal.store_name] && (
      <img
        src={STORE_ICONS[deal.store_name]}
        alt={deal.store_name}
        className="w-4 h-4 object-contain"
      />
    )}
    <span>Store: {deal.store_name}</span>
  </div>
)}


  {/* Category */}
  {deal.category && (
    <p>Category: {deal.category}</p>
  )}

  {/* Expiry */}
  {deal.expire_date && (
    <p>
      {expiresOn}:{" "}
      <span className="font-medium">
        {new Date(deal.expire_date).toLocaleDateString()}
      </span>
    </p>
  )}

  {/* Age warning */}
  {ageLevel === "old" && (
    <p className="text-amber-600">
      ⚠️ Older deal — availability may have changed
    </p>
  )}
</div>

{/* Telegram CTA — NOW SECONDARY */}
<div className="mx-auto max-w-lg mb-8 px-4">
  <TelegramCTA />
</div>
        {/* Notes */}
        
        {notes && (
          <div className="text-sm text-slate-700 mb-8 whitespace-pre-line leading-relaxed">

            {notes.replace(/https?:\/\/[^\s]+/g, "").trim()}
          </div>
        )}

        {/* Related Deals */}
        {relatedLinks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
            <h3 className="font-semibold mb-3">{otherDeals}</h3>
            <ul className="space-y-2">
              {relatedLinks.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
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
