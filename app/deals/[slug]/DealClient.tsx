"use client";

import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";
import Image from "next/image";
import { useDealViewTracker } from "@/lib/useDealViewTracker";


export default function DealClient({
  deal,
  viewsLastHour,
}: {
  deal: any;
  viewsLastHour: number;
}) {

useDealViewTracker(deal?.id);

  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;
  if (!deal) return null;

  const title = lang === "en" ? deal.description : deal.description_es;
  const notes = lang === "en" ? deal.notes : deal.notes_es;

  return (
    <main className="mx-auto max-w-3xl p-4">

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

        <a
          href="/"
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          ← Back to DealsWindfall
        </a>
      </header>
{viewsLastHour > 0 && (
  <p className="text-sm text-orange-600 mt-2">
    🔥 {viewsLastHour} people viewed this deal in the last hour
  </p>
)}

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4 text-gray-900">{title}</h1>

      {/* IMAGE */}
      {deal.image_link && (
        <div className="w-full bg-white p-4 rounded-md shadow mb-6 flex justify-center">
          <img
            src={deal.image_link}
            alt={title}
            className="max-h-96 w-auto object-contain"
          />
        </div>
      )}

      {/* ⭐ NEW INFO BOX ⭐ */}
      <div className="bg-gray-50 p-4 rounded-md shadow mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Deal Summary</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-medium text-gray-700">Current Price:</span>{" "}
            <span className="text-green-700 font-semibold">
              ${deal.current_price ?? "N/A"}
            </span>
          </p>

          <p>
            <span className="font-medium text-gray-700">Old Price:</span>{" "}
            <span className="text-red-600 font-semibold">
              {deal.old_price ? `$${deal.old_price}` : "N/A"}
            </span>
          </p>

          <p>
            <span className="font-medium text-gray-700">Percent Difference:</span>{" "}
            <span className="text-blue-700 font-semibold">
              {deal.percent_diff ? `${deal.percent_diff}%` : "N/A"}
            </span>
          </p>

          <p>
            <span className="font-medium text-gray-700">Store:</span>{" "}
            <span className="font-semibold">{deal.store_name ?? "N/A"}</span>
          </p>
        </div>

        {/* Purchase Link */}
        {deal.product_link && (
          <a
            href={deal.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            🔗 Go to Purchase Page
          </a>
        )}
      </div>

      {/* NOTES / DESCRIPTION */}
      <p className="text-gray-800 leading-relaxed mb-8 whitespace-pre-line">
        {notes}
      </p>
 <div className="mt-6 text-xs text-gray-500 border-t pt-4 px-2 leading-relaxed">
      <strong>{lang === "en" ? "Disclaimer:" : "Descargo de responsabilidad:"}</strong>{" "}
      {lang === "en" ? (
        <>
          We try our best to provide accurate pricing and deal information. Prices, coupons,
          availability, and stock levels can change anytime on the retailer’s website. Always verify
          details on the store’s checkout page. We are not responsible for expired or incorrect
          information.
        </>
      ) : (
        <>
          Hacemos todo lo posible para brindar información precisa sobre precios y ofertas. Los
          precios, cupones, disponibilidad y niveles de inventario pueden cambiar en cualquier
          momento en el sitio web del minorista. Siempre verifique los detalles en la página de pago
          de la tienda. No somos responsables por información vencida o incorrecta.
        </>
      )}
    </div>

    </main>
  );
}
