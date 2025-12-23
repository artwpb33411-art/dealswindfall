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

/*
export async function generateMetadata(props: {
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

  return {
    title: deal.description,
    description: deal.notes?.slice(0, 160),
  };
}
*/

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

  const canonicalId = getCanonicalDealId(deal);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return {
    title: deal.description,
    description: deal.notes?.slice(0, 160),

    alternates: {
      canonical: `${baseUrl}/deals/${canonicalId}-${deal.slug}`,
      languages: deal.slug_es
        ? {
            "es-ES": `${baseUrl}/es/deals/${canonicalId}-${deal.slug_es}`,
          }
        : undefined,
    },

    openGraph: {
      title: deal.description,
      description: deal.notes?.slice(0, 160),
      images: deal.image_link ? [deal.image_link] : [],
      url: `${baseUrl}/deals/${canonicalId}-${deal.slug}`,
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
