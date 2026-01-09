// ❌ IMPORTANT: DO NOT ADD "use client"

import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SiteShell from "@/components/layout/SiteShell";
import DealDetail from "@/components/DealDetail";
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
function extractId(slug: string): number | null {
  const idStr = slug.split("-")[0];
  const id = Number(idStr);
  return Number.isNaN(id) ? null : id;
}

/* -------------------------------------------------
   SEO Metadata
-------------------------------------------------- */
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select(
      "id, slug, slug_es, notes, description, superseded_by_id, canonical_to_id, image_link"
    )
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

  const canonicalId =
    deal.canonical_to_id ?? deal.superseded_by_id ?? deal.id;

  let canonicalSlug = deal.slug;
  let canonicalSlugEs = deal.slug_es;

  if (canonicalId !== deal.id) {
    const { data: canonical } = await supabase
      .from("deals")
      .select("slug, slug_es")
      .eq("id", canonicalId)
      .maybeSingle();

    if (canonical) {
      canonicalSlug = canonical.slug;
      canonicalSlugEs = canonical.slug_es;
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const canonicalUrl = `${baseUrl}/deals/${canonicalId}-${canonicalSlug}`;
  const canonicalEsUrl = canonicalSlugEs
    ? `${baseUrl}/es/deals/${canonicalId}-${canonicalSlugEs}`
    : undefined;

  return {
    title: deal.description,
    description: deal.notes?.slice(0, 160),

    alternates: {
      canonical: canonicalUrl,
      languages: canonicalEsUrl
        ? { "es-ES": canonicalEsUrl }
        : undefined,
    },

    openGraph: {
      title: deal.description,
      description: deal.notes?.slice(0, 160),
      images: deal.image_link ? [deal.image_link] : [],
      url: canonicalUrl,
    },
  };
}

/* -------------------------------------------------
   PAGE COMPONENT
-------------------------------------------------- */
export default async function DealPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
const { slug } = await props.params;
const searchParams = await props.searchParams;


  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

const totalViews = await getDealViewsTotal(deal.id);

// Collect excluded IDs
const excludeIds: number[] = [];

// Exclude the previous deal (loop breaker)
const from = searchParams?.from;
if (from && !Number.isNaN(Number(from))) {
  excludeIds.push(Number(from));
}

const relatedDeals = await getRelatedDeals({
  dealId: deal.id,
  category: deal.category,
  store: deal.store_name,
  price: deal.price,
  excludeIds, // ✅ pass data only
});


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
