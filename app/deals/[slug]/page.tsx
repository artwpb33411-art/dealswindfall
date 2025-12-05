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
