import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Extract ID from slug
function extractId(slug: string): number | null {
  const id = slug.split("-")[0];
  return Number(id) || null;
}

// Build Spanish metadata
export async function generateMetadata({ params }: any) {
  const { slug } = params;
  const id = extractId(slug);

  if (!id) return { title: "Oferta no encontrada" };

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) return { title: "Oferta no encontrada" };

  return {
    title: deal.description_es || deal.description,
    description: deal.description_es || deal.description,
    alternates: {
      canonical: `/es/deal/${slug}`,
      languages: {
        "en-US": `/deal/${deal.id}-${deal.slug || ""}`,
      },
    },
    openGraph: {
      title: deal.description_es,
      description: deal.description_es,
      images: deal.imageLink ? [deal.imageLink] : [],
      type: "article",
      url: `/es/deal/${slug}`,
    },
  };
}

export default async function SpanishDealPage({ params }: any) {
  const { slug } = params;
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
      
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {deal.description_es || deal.description}
      </h1>

      {/* Image */}
      {deal.imageLink && (
        <img
          src={deal.imageLink}
          alt={deal.description_es || deal.description}
          className="w-full max-h-96 object-contain mb-4 bg-white rounded-md shadow"
        />
      )}

      {/* Price */}
      <div className="text-xl font-semibold text-green-600 mb-4">
        {deal.currentPrice ? `$${deal.currentPrice}` : ""}
        {deal.oldPrice && (
          <span className="ml-2 line-through text-gray-500">
            ${deal.oldPrice}
          </span>
        )}
      </div>

      {/* Store */}
      <p className="text-gray-700 mb-3 text-sm">
        Tienda: <strong>{deal.storeName}</strong>
      </p>

      {/* Spanish Description */}
      <p className="text-gray-800 mb-6 leading-relaxed">
        {deal.description_es || deal.description}
      </p>

      {/* Product Link */}
      {deal.productLink && (
        <a
          href={deal.productLink}
          className="inline-block bg-red-600 text-white px-5 py-3 rounded-md text-lg hover:bg-red-700"
          target="_blank"
        >
          Ver Oferta
        </a>
      )}

      {/* English Link Back */}
      <div className="mt-8">
        <a
          href={`/deal/${deal.id}-${deal.slug}`}
          className="text-blue-600 underline text-sm"
        >
          View this deal in English →
        </a>
      </div>
    </main>
  );
}
