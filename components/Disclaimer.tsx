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
          DealsWindfall is an independent deal discovery website and does not sell products directly.
          Prices, discounts, coupons, availability, and stock levels may change at any time on the
          retailer’s website. Always verify details on the retailer’s checkout page before making a
          purchase. DealsWindfall may apply for or participate in affiliate programs and may earn a
          commission from qualifying purchases at no additional cost to you. We are not responsible
          for expired, incorrect, or third-party information.
        </>
      ) : (
        <>
          DealsWindfall es un sitio web independiente de descubrimiento de ofertas y no vende
          productos directamente. Los precios, descuentos, cupones, disponibilidad y niveles de
          inventario pueden cambiar en cualquier momento en el sitio web del minorista. Siempre
          verifique los detalles en la página de pago del minorista antes de realizar una compra.
          DealsWindfall puede solicitar o participar en programas de afiliados y podría recibir una
          comisión por compras que califiquen sin costo adicional para usted. No somos responsables
          por información vencida, incorrecta o proporcionada por terceros.
        </>
      )}
    </div>
  );
}
