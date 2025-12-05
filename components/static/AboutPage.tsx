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
    <div className="p-6 text-gray-700 leading-relaxed">

      {lang === "en" ? (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            About DealsWindfall
          </h1>

          <p className="text-[14px] mb-2">
            Welcome to <strong>DealsWindfall</strong> — your trusted destination for discovering the
            best discounts, flash sales, and special offers from popular online and retail stores.
          </p>

          <p className="text-[14px] mb-2">
            Our goal is simple: to help shoppers save time and money by curating verified deals from
            trusted sources such as Amazon, Walmart, Target, Best Buy, and many more. We believe that
            great deals shouldn’t be hard to find — so we’ve built a platform that brings them all
            together in one place.
          </p>

          <p className="text-[14px] mb-2">
            Whether you’re looking for electronics, apparel, home essentials, or beauty care
            products, DealsWindfall makes it easy to browse, compare, and grab the best value for
            your money.
          </p>
        </>

      ) : (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            Acerca de DealsWindfall
          </h1>

          <p className="text-[14px] mb-2">
            Bienvenido a <strong>DealsWindfall</strong> — tu destino confiable para descubrir los
            mejores descuentos, ventas relámpago y ofertas especiales de tiendas en línea y minoristas
            populares.
          </p>

          <p className="text-[14px] mb-2">
            Nuestro objetivo es simple: ayudar a los compradores a ahorrar tiempo y dinero
            seleccionando ofertas verificadas de fuentes confiables como Amazon, Walmart, Target,
            Best Buy y muchas más. Creemos que las buenas ofertas no deberían ser difíciles de
            encontrar — por eso hemos creado una plataforma que las reúne todas en un solo lugar.
          </p>

          <p className="text-[14px] mb-2">
            Ya sea que busques electrónicos, ropa, artículos esenciales para el hogar o productos de
            cuidado personal, DealsWindfall hace que sea fácil explorar, comparar y obtener el mejor
            valor por tu dinero.
          </p>
        </>
      )}

    </div>
  );
}
