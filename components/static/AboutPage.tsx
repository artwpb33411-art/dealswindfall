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
    /* Added pb-24 for extra bottom space and min-h-screen to ensure the container is tall enough */
    <div className="p-6 pb-24 text-gray-700 leading-relaxed overflow-y-auto scrollbar-thin max-w-4xl mx-auto min-h-screen">
      {lang === "en" ? (
        <>
          <h1 className="text-3xl font-bold text-blue-600 mb-4">About DealsWindfall</h1>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Who We Are</h2>
            <p className="text-base mb-3">
              <strong>DealsWindfall</strong> is a premier deal-discovery hub dedicated to finding the 
              deepest discounts across the web. Our mission is to bridge the gap between shoppers and 
              top-tier retailers like Amazon, eBay, and Walmart.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Our Curation Process</h2>
            <p className="text-base mb-3">
              In a world of "fake sales," we focus on <strong>real value</strong>. Our system scans 
              thousands of listings daily, filtering for limited-time price drops and verified coupons. 
              We prioritize deals that are "fresh" so you know they are still active.
            </p>
          </section>

          <section className="mb-6 bg-gray-50 p-4 border-l-4 border-blue-600 rounded">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Transparency & Trust</h2>
            <p className="text-sm">
              DealsWindfall is an independent platform. We do not process payments or ship products. 
              As part of our commitment to transparency, note that we participate in the Amazon Associates, 
              eBay Partner Network, and Walmart Affiliate programs. This means we may earn a small 
              commission on qualifying purchases at no extra cost to you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Contact Us</h2>
            <p className="text-base">
              Have a question? Reach out to our team at: 
              <br />
            <a
              href="https://www.dealswindfall.com/contact"
              className="text-blue-600 underline"
            >
              https://www.dealswindfall.com/contact
            </a>
            </p>
          </section>
          
		  
	  
          {/* This empty div acts as a "spacer" for mobile safe areas */}
          <div className="h-12 w-full" aria-hidden="true"></div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Acerca de DealsWindfall</h1>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Quiénes Somos</h2>
            <p className="text-base mb-3">
              <strong>DealsWindfall</strong> es un centro de descubrimiento de ofertas dedicado a encontrar 
              los descuentos más profundos en la web. Nuestra misión es conectar a los compradores con 
              minoristas como Amazon, eBay y Walmart.
            </p>
          </section>

           <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Nuestro Proceso de Selección</h2>
            <p className="text-base mb-3">
             En un mundo lleno de "falsas rebajas", nos enfocamos en el <strong>valor real</strong>. 
        Nuestro sistema analiza miles de listados diariamente, filtrando caídas de precios por 
        tiempo limitado y cupones verificados. Priorizamos las ofertas "frescas" para que 
        sepas que aún están activas al momento de publicarlas.
            </p>
          </section>

          <section className="mb-6 bg-gray-50 p-4 border-l-4 border-blue-600 rounded">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Transparencia y Confianza</h2>
            <p className="text-sm">
              Somos participantes en los programas de afiliados de Amazon, eBay y Walmart. 
              Podemos ganar una pequeña comisión por compras elegibles sin costo adicional para usted.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Contacto</h2>
            <p className="text-base">
              ¿Tiene preguntas? Contáctenos en: 
                <br />
            <a
              href="https://www.dealswindfall.com/contact"
              className="text-blue-600 underline"
            >
              https://www.dealswindfall.com/contact
            </a>
            </p>
          </section>

          {/* Espaciador para móviles */}
          <div className="h-12 w-full" aria-hidden="true"></div>
        </>
      )}
    </div>
  );
}