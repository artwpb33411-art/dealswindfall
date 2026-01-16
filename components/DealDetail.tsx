"use client";
import { STORE_ICONS } from "@/lib/storeIcons";
import RelatedDeals from "@/components/deals/RelatedDeals";
import DealAgeWarning from "@/components/shared/DealAgeWarning";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";
import OutboundDealCTA from "@/components/shared/OutboundDealCTA";
import TelegramCTA from "@/components/shared/TelegramCTA";
import ShareDealButton from "@/components/shared/ShareDealButton";
import Disclaimer from "@/components/Disclaimer";
import { trackDealView } from "@/lib/trackDealView";

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
interface RelatedDeal {
  id: number;
  slug: string;
  title: string;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  store_name: string | null;
}

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

  totalViews?: number;
  relatedDeals?: RelatedDeal[];
  engagementDeals?: RelatedDeal[]; // ✅ NEW
   engagementLinkType?: "slug" | "id"; 
}



export default function DealDetail({
  deal,
  totalViews,
  relatedDeals,
  engagementDeals, // ✅ ADD THIS
   engagementLinkType = "slug",
}: DealDetailProps) {


 

  /* ---------------------------------------------------------
     🔹 Hooks
  --------------------------------------------------------- */
  const { lang, hydrated } = useLangStore();
  const [copied, setCopied] = useState(false);
 // const [relatedLinks, setRelatedLinks] = useState<any[]>([]);
 
   
  /* ---------------------------------------------------------
     🔹 Load related links
  --------------------------------------------------------- */
 /*
  if (!hydrated) return null;
useEffect(() => {
  if (deal?.id) {
    trackDealView(deal.id);
  }
}, [deal?.id]);
*/
 // ✅ Hooks must ALWAYS run
  useEffect(() => {
    if (!hydrated) return;      // guard INSIDE effect
    if (!deal?.id) return;

    trackDealView(deal.id);
  }, [hydrated, deal?.id]);

  // ✅ Conditional return AFTER hooks
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
  const isOldDeal = ageLevel === "old";
  const viewDealText =
  lang === "en"
    ? isOldDeal
      ? "Check Current Price"
      : "View Deal"
    : isOldDeal
    ? "Ver precio actual"
    : "Ver Oferta";


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
  {/* LEFT: Total Views */}
<div
  className={`
    inline-flex items-center gap-1.5
    px-2.5 py-1
    text-xs font-medium
    rounded-full
    border
    min-h-6
    min-w-[72px]
    transition-opacity
    duration-200
    ${
      typeof totalViews === "number" && totalViews > 0
        ? "opacity-100 bg-slate-50 border-slate-200 text-slate-600"
        : "opacity-0 border-transparent"
    }
  `}
  aria-hidden={!(typeof totalViews === "number" && totalViews > 0)}
>
  <span className="text-slate-400">👁</span>
  <span>
    {typeof totalViews === "number" ? totalViews.toLocaleString() : ""}
  </span>
  <span className="text-slate-400">views</span>
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
  url={`https://www.dealswindfall.com/?deal=${deal.id}`}
    />
    </div>
  </div>
</div>

{/* TITLE */}
<h1 className="text-xl md:text-2xl font-bold text-slate-900 text-center leading-snug mb-4">
  {title || "Untitled Deal"}
</h1>



		 {/* Image */}
        {deal.image_link && (
          <div className="flex justify-center mb-4">
            <img
  src={deal.image_link}
  alt={title}
  className={`max-h-72 object-contain rounded-xl border bg-white transition ${
    isOldDeal ? "opacity-70 saturate-75" : ""
  }`}
/>

          </div>
        )}

        {/* View Deal Button */}
        {deal.product_link && (
          <div className="mb-4 space-y-1 max-w-xl mx-auto">

         <OutboundDealCTA
  link={deal.product_link}
  label={viewDealText}
  dealId={deal.id}
  store={deal.store_name}
  category={deal.category}
  className="w-full h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
  enableInAppOverlay={false} // ✅ keep slug behavior unchanged for now
/>





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
  <DealAgeWarning publishedAt={deal.published_at} className="text-amber-600" />

</div>

{/* Telegram CTA — NOW SECONDARY */}
<div className="mx-auto max-w-lg mb-8 px-4">
  <TelegramCTA />
</div>
{/* Deals you may be interested in */}
{relatedDeals && relatedDeals.length >= 2 && (
 <RelatedDeals
  deals={relatedDeals}
  currentDealId={deal.id}
/>

)}

{engagementDeals && engagementDeals.length > 0 && (
  <section className="mt-10">
   

    <RelatedDeals
      deals={engagementDeals}
      currentDealId={deal.id}
      linkType={engagementLinkType} // ✅ IMPORTANT
    />
  </section>
)}



        {/* Notes */}
  <hr className="my-10 border-slate-200" />
      
        {notes && (
       <div className="
  text-base
  text-slate-800
  leading-relaxed
  whitespace-pre-line
  max-w-3xl
  
">


            {notes.replace(/https?:\/\/[^\s]+/g, "").trim()}
          </div>
        )}


        <Disclaimer />
      </div>
    </div>
  );
}