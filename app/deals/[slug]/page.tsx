// ❌ IMPORTANT: DO NOT ADD "use client"

import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DealClient from "./DealClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function extractId(slug: string): number | null {
  const idStr = slug.split("-")[0];
  const id = Number(idStr);
  return Number.isNaN(id) ? null : id;
}

function getCanonicalDealId(deal: any) {
  return deal.superseded_by_id || deal.canonical_to_id || deal.id;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const id = extractId(slug);
  if (!id) return notFound();

  // 1️⃣ Load current deal (full)
  const { data: deal } = await supabase
    .from("deals")
    .select(
      "id, slug, slug_es, notes, description, superseded_by_id, canonical_to_id, image_link"
    )
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

  // 2️⃣ Resolve canonical ID
  const canonicalId =
    deal.canonical_to_id ?? deal.superseded_by_id ?? deal.id;

  // 3️⃣ Load canonical deal (MINIMAL SHAPE)
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
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

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


export default async function DealPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

  return <DealClient deal={deal} />;
}
