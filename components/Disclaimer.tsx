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
  <p className="mb-2">
    <strong>As an Amazon Associate, I earn from qualifying purchases.</strong>
  </p>
  <p>
    DealsWindfall is an independent deal discovery website and a participant in the 
    eBay Partner Network and Walmart Affiliate Program. We may earn a commission 
    from qualifying purchases at no additional cost to you. Prices, discounts, 
    and availability may change at any time; always verify details on the 
    retailer’s checkout page. We are not responsible for expired or incorrect 
    third-party information.
  </p>
</>
      ) : (
  <>
    <p className="mb-2">
      <strong>Como asociado de Amazon, percibo ingresos por las compras elegibles.</strong>
    </p>
    <p>
      DealsWindfall es un sitio web independiente de descubrimiento de ofertas y 
      participa en el eBay Partner Network y el Programa de Afiliados de Walmart. 
      Podemos recibir una comisión por las compras que califiquen, sin costo adicional 
      para usted. Los precios, descuentos y la disponibilidad pueden cambiar en 
      cualquier momento; verifique siempre los detalles en la página de pago del 
      minorista. No nos hacemos responsables por información de terceros vencida 
      o incorrecta.
    </p>
  </>
)
      
      }
    </div>
  );
}
