"use client";

import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";

export default function AboutPage() {
  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  return (
    <div className="p-6 text-gray-700 leading-relaxed overflow-y-auto scrollbar-thin">
      {lang === "en" ? (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            About DealsWindfall
          </h1>

          <p className="text-[14px] mb-2">
            <strong>DealsWindfall</strong> is an independent deal discovery platform designed
            to help shoppers find genuine discounts, limited-time offers, and value deals
            from well-known online and retail stores.
          </p>

          <p className="text-[14px] mb-2">
            We research, curate, and organize deals across multiple categories such as
            electronics, home essentials, fashion, beauty, and everyday products — making
            it easier for users to compare options and save time while shopping.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall does <strong>not sell products directly</strong>. When you click
            on a deal, you are redirected to the retailer’s website where the purchase is
            completed under their terms, pricing, and policies.
          </p>

          <p className="text-[14px] mb-2">
            Our mission is simple: to create a clean, transparent, and user-friendly space
            where shoppers can discover real savings without misleading pricing or hidden
            intent.
          </p>

          <p className="text-[14px] mb-2">
            As we continue to grow, our focus remains on accuracy, trust, and delivering
            helpful information — so users can shop confidently and make informed decisions.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            Acerca de DealsWindfall
          </h1>

          <p className="text-[14px] mb-2">
            <strong>DealsWindfall</strong> es una plataforma independiente de descubrimiento
            de ofertas diseñada para ayudar a los compradores a encontrar descuentos reales,
            promociones por tiempo limitado y ofertas de valor en tiendas en línea y físicas
            reconocidas.
          </p>

          <p className="text-[14px] mb-2">
            Investigamos, seleccionamos y organizamos ofertas en múltiples categorías como
            electrónicos, artículos para el hogar, moda, belleza y productos de uso diario,
            facilitando la comparación y el ahorro de tiempo al comprar.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall <strong>no vende productos directamente</strong>. Al hacer clic en
            una oferta, será redirigido al sitio web del minorista donde la compra se realiza
            bajo sus propios precios, términos y políticas.
          </p>

          <p className="text-[14px] mb-2">
            Nuestra misión es simple: crear un espacio claro, transparente y fácil de usar
            donde los compradores puedan descubrir ahorros reales sin información engañosa.
          </p>

          <p className="text-[14px] mb-2">
            A medida que seguimos creciendo, nuestro enfoque sigue siendo la precisión,
            la confianza y la entrega de información útil para que los usuarios compren
            con seguridad y tomen decisiones informadas.
          </p>
        </>
      )}
    </div>
  );
}
