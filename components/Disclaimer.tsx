"use client";

import { useLangStore } from "@/lib/languageStore";
import { useEffect } from "react";

export default function Disclaimer() {
  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  return (
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
  );
}
