"use client";

import { useEffect, useMemo, useState } from "react";
import { useLangStore } from "@/lib/languageStore";

type BlogListClientProps = {
  posts: any[];
};

const PAGE_SIZE = 10;

export default function BlogListClient({ posts }: BlogListClientProps) {
  const { lang, hydrated, hydrate } = useLangStore((s) => s);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Always run hooks before any conditional return
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // We still run useMemo even if not hydrated (safe)
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((p) => {
      const tEn = (p.title_en || "").toLowerCase();
      const tEs = (p.title_es || "").toLowerCase();
      const dEn = (p.meta_description_en || "").toLowerCase();
      const dEs = (p.meta_description_es || "").toLowerCase();

      return (
        tEn.includes(q) ||
        tEs.includes(q) ||
        dEn.includes(q) ||
        dEs.includes(q)
      );
    });
  }, [posts, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = filteredPosts.slice(start, start + PAGE_SIZE);

  const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pageLabel =
    lang === "es"
      ? `Página ${page} de ${totalPages}`
      : `Page ${page} of ${totalPages}`;

  // ❗️SAFE conditional return — AFTER hooks and useMemo
  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <a href="/" aria-label="Go to DealsWindfall home">
          <img src="/dealswindfall-logoA.png" alt="DealsWindfall" className="h-10" />
        </a>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-center">
        {lang === "es" ? "Blog de DealsWindfall" : "DealsWindfall Blog"}
      </h1>

      {/* Search */}
      <input
        className="w-full border rounded-md p-2 text-sm mt-4"
        placeholder={
          lang === "es"
            ? "Buscar artículos del blog…"
            : "Search blog posts…"
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
      />

      {/* Table */}
      <div className="mt-4 border rounded-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 text-sm font-semibold border-b">
                {lang === "es" ? "Artículo" : "Article"}
              </th>
              <th className="text-right p-3 text-sm font-semibold border-b w-32">
                {lang === "es" ? "Fecha" : "Date"}
              </th>
            </tr>
          </thead>

          <tbody>
            {pagePosts.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="p-4 text-center text-gray-500 text-sm"
                >
                  {lang === "es"
                    ? "No se encontraron artículos."
                    : "No blog posts found."}
                </td>
              </tr>
            )}

            {pagePosts.map((post) => {
              const title =
                lang === "es" && post.title_es
                  ? post.title_es
                  : post.title_en;
              const desc =
                lang === "es" && post.meta_description_es
                  ? post.meta_description_es
                  : post.meta_description_en;

              return (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    window.location.href = `/blog/${post.slug}`;
                  }}
                >
                  <td className="p-3 align-top border-t">
                    <h2 className="text-base font-semibold mb-1">{title}</h2>
                    {desc && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {desc}
                      </p>
                    )}
                  </td>

                  <td className="p-3 align-top border-t text-right text-xs text-gray-500">
                    {formatDate(post.published_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">{pageLabel}</span>

          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded border text-xs ${
                page <= 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {lang === "es" ? "Anterior" : "Prev"}
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded border text-xs ${
                page >= totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {lang === "es" ? "Siguiente" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
