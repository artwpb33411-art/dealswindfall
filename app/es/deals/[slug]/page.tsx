import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Extract numeric ID from slug (id-text)
function extractId(slug: string | undefined): number | null {
  if (!slug) return null;
  const idPart = slug.split("-")[0];
  const id = Number(idPart);
  return Number.isNaN(id) ? null : id;
}
function getCanonicalDealId(deal: any) {
  return deal.superseded_by_id || deal.canonical_to_id || deal.id;
}

// ===============================
//   SEO Metadata (Spanish)
// ===============================
/*
export async function generateMetadata({ params }: any) {
  const { slug } = await params; // REQUIRED FIX

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) {
    return {
      title: "Oferta no encontrada",
      description: "Esta oferta no existe.",
    };
  }

  return {
    title: deal.description_es || deal.description,
    description: deal.notes_es?.slice(0, 150) || deal.notes?.slice(0, 150),
    alternates: {
      canonical: `/es/deals/${slug}`,
      languages: {
        "en-US": `/deals/${deal.id}-${deal.slug}`,
      },
    },
    openGraph: {
      title: deal.description_es || deal.description,
      description: deal.notes_es?.slice(0, 150) || deal.notes?.slice(0, 150),
      images: deal.image_link ? [deal.image_link] : [],
      url: `/es/deals/${slug}`,
    },
  };
}
*/


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
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

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



// ===============================
//  PAGE COMPONENT (Spanish)
// ===============================
export default async function SpanishDealPage({ params }: any) {
  const { slug } = await params; // REQUIRED FIX

  const id = extractId(slug);
  if (!id) return notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-4">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <a href="/" className="flex items-center gap-2 group">
          <Image
            src="/dealswindfall-logoA.png"
            alt="DealsWindfall Logo"
            width={140}
            height={40}
            className="object-contain"
          />
        </a>

        <a href="/es" className="text-sm text-blue-600 font-medium hover:underline">
          ← Volver a DealsWindfall
        </a>
      </header>

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        {deal.description_es || deal.description}
      </h1>

      {/* IMAGE */}
      {deal.image_link && (
        <div className="w-full bg-white p-4 rounded-md shadow mb-6 flex justify-center">
          <img
            src={deal.image_link}
            alt={deal.description_es || deal.description}
            className="max-h-96 w-auto object-contain"
          />
        </div>
      )}

      {/* PRICING */}
      <div className="text-xl mb-4 flex items-center gap-3">
        {deal.current_price && (
          <span className="font-semibold text-green-600">
            ${deal.current_price}
          </span>
        )}
        {deal.old_price && (
          <span className="line-through text-gray-400">${deal.old_price}</span>
        )}
        {deal.percent_diff && (
          <span className="text-sm text-red-600 font-bold">
            -{deal.percent_diff.toFixed(0)}%
          </span>
        )}
      </div>

      {/* VIEW DEAL BUTTON */}
      {deal.product_link && (
        <a
          href={deal.product_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium shadow"
        >
          Ver Oferta →
        </a>
      )}

      {/* STORE */}
      <p className="text-gray-700 text-sm mb-10">
        <br></br><br></br>
		Tienda: <strong>{deal.store_name}</strong>
      </p>

      {/* SPANISH DESCRIPTION */}
      <p className="text-gray-800 leading-relaxed mb-8 whitespace-pre-line">
        {deal.notes_es || deal.notes}
      </p>

      {/* English Link */}
      <a
        href={`/deals/${deal.id}-${deal.slug}`}
        className="text-blue-600 underline text-sm"
      >
        View this deal in English →
      </a>
    </main>
  );
}
