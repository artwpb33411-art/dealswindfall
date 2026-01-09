// ❌ IMPORTANT: DO NOT ADD "use client"

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import DealDetail from "@/components/DealDetail";
import SiteShell from "@/components/layout/SiteShell";
import { getDealViewsTotal } from "@/lib/dealViews";
import { getRelatedDeals } from "@/lib/getRelatedDeals";

/* -------------------------------------------------
   Supabase (server-side)
-------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
function extractId(slug: string | undefined): number | null {
  if (!slug) return null;
  const idPart = slug.split("-")[0];
  const id = Number(idPart);
  return Number.isNaN(id) ? null : id;
}

function getCanonicalDealId(deal: any) {
  return deal.superseded_by_id || deal.canonical_to_id || deal.id;
}

/* -------------------------------------------------
   SEO Metadata (Spanish)
-------------------------------------------------- */
export async function generateMetadata({ params }: any) {
  const { slug } = await params;

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select(
      "id, slug, slug_es, notes, notes_es, description, description_es, superseded_by_id, canonical_to_id, image_link"
    )
    .eq("id", id)
    .maybeSingle();

  if (!deal) {
    return {
      title: "Oferta no encontrada",
      description: "Esta oferta no existe.",
    };
  }

  const canonicalId = getCanonicalDealId(deal);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: deal.description_es || deal.description,
    description: deal.notes_es?.slice(0, 150) || deal.notes?.slice(0, 150),

    alternates: {
      canonical: `${baseUrl}/es/deals/${canonicalId}-${deal.slug_es}`,
      languages: {
        "en-US": `${baseUrl}/deals/${canonicalId}-${deal.slug}`,
      },
    },

    openGraph: {
      title: deal.description_es || deal.description,
      description: deal.notes_es?.slice(0, 150) || deal.notes?.slice(0, 150),
      images: deal.image_link ? [deal.image_link] : [],
      url: `${baseUrl}/es/deals/${canonicalId}-${deal.slug_es}`,
    },
  };
}

/* -------------------------------------------------
   PAGE COMPONENT (Spanish)
-------------------------------------------------- */
export default async function SpanishDealPage({ params }: any) {
  const { slug } = await params;

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

  const totalViews = await getDealViewsTotal(deal.id);

  const relatedDeals = await getRelatedDeals({
    dealId: deal.id,
    category: deal.category,
    store: deal.store_name,
    price: deal.price,
  });
console.log("Related deals count:", relatedDeals.length);

  return (
    <SiteShell>
      <DealDetail
        deal={deal}
        totalViews={totalViews}
        relatedDeals={relatedDeals}
        
      />
    </SiteShell>
  );
}
