"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import TelegramCTA from "@/components/shared/TelegramCTA";
import ShareDealButton from "@/components/shared/ShareDealButton";
import Disclaimer from "@/components/Disclaimer";
import {
  getRelativeTime,
  getAbsoluteLocalTime,
  getDealAgeLevel,
} from "@/lib/ui/dealTime";

import { createClient } from "@supabase/supabase-js";
import { useLangStore } from "@/lib/languageStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DealDetail({ deal }: { deal: any }) {
  /* ---------------------------------------------------------
     🔹 ALL HOOKS FIRST (React rules)
  --------------------------------------------------------- */
  const { lang, hydrated, hydrate } = useLangStore();
  const [copied, setCopied] = useState(false);
  const [relatedLinks, setRelatedLinks] = useState<any[]>([]);

  // ✅ Prevent duplicate deal view tracking
  const lastTrackedDealId = useRef<number | null>(null);

  useEffect(() => {
    hydrate();
  }, []);

  /* ---------------------------------------------------------
     🔹 DEAL VIEW TRACKING (FIXED)
     Fires once per deal open (split pane or full page)
  --------------------------------------------------------- */
  useEffect(() => {
    if (!deal?.id) return;
const sessionKey = `dw_deal_viewed_${deal.id}`;

  // 🚫 HARD STOP if already tracked in this session
  if (sessionStorage.getItem(sessionKey)) return;

  sessionStorage.setItem(sessionKey, "1");
    trackEvent({
      event_name: "deal_page_view",
      event_type: "view",
      deal_id: deal.id,
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, [deal?.id]);

  /* ---------------------------------------------------------
     🔹 Load related links
  --------------------------------------------------------- */
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
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-900 flex-1">
            {title || "Untitled Deal"}
          </h1>

          <ShareDealButton
            title={`${title} – $${deal.current_price}`}
            url={`https://www.dealswindfall.com/deals/${deal.id}-${deal.slug}`}
          />
        </div>

        {/* Image */}
        {deal.image_link && (
          <div className="flex justify-center mb-5">
            <img
              src={deal.image_link}
              alt={title}
              className="max-h-72 object-contain rounded-xl border bg-white"
            />
          </div>
        )}

        {/* View Deal Button */}
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

        <TelegramCTA />

        {/* Coupon */}
        {deal.coupon_code && (
          <div className="mb-4 p-3 bg-amber-50 border rounded-xl">
            <p className="text-sm font-medium mb-2">{couponLabel}</p>

            <div className="flex gap-2">
              <div className="px-4 py-2 bg-yellow-100 border rounded font-mono">
                {deal.coupon_code}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(deal.coupon_code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="px-3 py-2 border rounded"
              >
                {copied ? copiedText : copyText}
              </button>
            </div>
          </div>
        )}

        {/* Prices */}
        <div className="flex gap-3 mb-3">
          {deal.current_price != null && (
            <span className="text-3xl font-bold text-green-600">
              ${deal.current_price.toFixed(2)}
            </span>
          )}

          {deal.old_price != null && (
            <span className="line-through text-slate-400">
              ${deal.old_price.toFixed(2)}
            </span>
          )}

          {deal.percent_diff != null && (
            <span className="text-red-600 font-semibold">
              -{deal.percent_diff.toFixed(0)}%
            </span>
          )}
        </div>

        {relativeTime && (
          <div className="text-sm text-slate-500 mb-4">
            {addedOn}: {relativeTime}
            {absoluteTime && (
              <span className="ml-1 text-slate-400">
                ({absoluteTime})
              </span>
            )}
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
          <div className="text-sm text-slate-700 mb-6 whitespace-pre-line">
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
