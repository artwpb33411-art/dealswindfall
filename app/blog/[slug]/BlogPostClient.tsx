// app/blog/[slug]/BlogPostClient.tsx
"use client";

import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";

export default function BlogPostClient({ post }: { post: any }) {
  const { lang, hydrated, hydrate } = useLangStore((s) => s);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  const title =
    lang === "es" && post.title_es ? post.title_es : post.title_en;

  const content =
    lang === "es" && post.content_es
      ? post.content_es
      : post.content_en;

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const publishedLabel =
    lang === "es" ? "Publicado el" : "Published on";

  const disclaimerText =
    lang === "es"
      ? "Aviso: DealsWindfall participa en programas de afiliados. Es posible que ganemos una pequeña comisión, sin costo adicional para ti, cuando haces clic en algunos enlaces de este blog. La información se proporciona solo con fines informativos; siempre verifica los precios y condiciones directamente en la tienda."
      : "Disclaimer: DealsWindfall participates in affiliate programs. We may earn a small commission, at no extra cost to you, when you click some links in this blog. Information is provided for informational purposes only; always verify prices and conditions directly with the store.";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Logo */}
      <div className="flex justify-center">
        <a href="/" aria-label="Go to DealsWindfall home">
          <img
            src="/dealswindfall-logoA.png" // 🔁 change if needed
            alt="DealsWindfall"
            className="h-10"
          />
        </a>
      </div>

      <article className="prose max-w-none">
        {/* Publish date */}
        {post.published_at && (
          <p className="text-xs text-gray-500">
            {publishedLabel}: {formatDate(post.published_at)}
          </p>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3">{title}</h1>

        {/* Cover image */}
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={title}
            className="rounded mb-4 w-full"
          />
        )}

        {/* Content */}
        <div dangerouslySetInnerHTML={{ __html: content }} />

        {/* Disclaimer */}
        <hr className="my-6" />
        <p className="text-xs text-gray-500 leading-relaxed">
          {disclaimerText}
        </p>
      </article>
    </div>
  );
}
