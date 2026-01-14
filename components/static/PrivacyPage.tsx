"use client";
import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";

export default function PrivacyPage() {
  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  return (
    <div className="p-6 pb-24 text-gray-700 leading-relaxed overflow-y-auto scrollbar-thin max-w-4xl mx-auto min-h-screen">
      {lang === "en" ? (
        <>
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: January 2026</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">1. Information Collection</h2>
            <p className="text-base mb-3">
              DealsWindfall respects your privacy. We do not collect personal identification 
              information unless you voluntarily contact us. We may collect non-personal 
              data such as browser type and access times to optimize our service.
            </p>
          </section>

          {/* CRITICAL SECTION FOR COMPLIANCE */}
          <section className="mb-6 bg-blue-50 p-5 border-l-4 border-blue-600 rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-blue-800">2. Third-Party Advertising & Cookies</h2>
            <p className="text-base mb-3 font-medium">
              Our website uses cookies to track affiliate referrals and improve user experience.
            </p>
            <p className="text-sm mb-3">
              We work with third-party partners including <strong>Amazon, eBay, and Walmart</strong>. 
              These partners may use cookies, web beacons, and other technologies to collect 
              information directly from your browser when you interact with our deals. 
              This information is used to track sales and provide us with a commission for 
              referred purchases.
            </p>
            <p className="text-sm">
              Specifically, <strong>third-party vendors</strong>, including Google and Amazon, 
              use cookies to serve ads or track conversions based on your prior visits to 
              DealsWindfall. You may opt-out of personalized advertising by visiting your 
              browser settings or the retailers' respective privacy portals.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">3. Contact Us</h2>
            <p className="text-base mb-4">
              If you have questions about this policy, please reach us through our contact page:
              <br />
              <a href="https://www.dealswindfall.com/contact" className="text-blue-600 underline font-medium">
                https://www.dealswindfall.com/contact
              </a>
            </p>
          </section>

          
          
          <div className="h-20 w-full" aria-hidden="true"></div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Política de Privacidad</h1>
          <p className="text-sm text-gray-500 mb-6">Última actualización: Enero 2026</p>
 
 
 
		  
		  <section className="mb-6">
  <h2 className="text-xl font-semibold mb-2 text-gray-800">1. Recopilación de Información</h2>
  <p className="text-base mb-3">
    DealsWindfall respeta su privacidad. No recopilamos información de identificación 
    personal a menos que usted se ponga en contacto con nosotros voluntariamente. 
    Podemos recopilar datos no personales, como el tipo de navegador y las horas de 
    acceso, para optimizar nuestro servicio.
  </p>
</section>
		  
         {/* SECCIÓN CRÍTICA PARA EL CUMPLIMIENTO */}
<section className="mb-6 bg-blue-50 p-5 border-l-4 border-blue-600 rounded shadow-sm">
  <h2 className="text-xl font-semibold mb-3 text-blue-800">2. Publicidad de Terceros y Cookies</h2>
  <p className="text-base mb-3 font-medium">
    Nuestro sitio web utiliza cookies para rastrear referencias de afiliados y mejorar la experiencia del usuario.
  </p>
  <p className="text-sm mb-3">
    Trabajamos con socios externos, incluidos <strong>Amazon, eBay y Walmart</strong>. 
    Estos socios pueden utilizar cookies, balizas web (web beacons) y otras tecnologías para 
    recopilar información directamente de su navegador cuando interactúa con nuestras ofertas. 
    Esta información se utiliza para rastrear las ventas y proporcionarnos una comisión por 
    las compras referidas.
  </p>
  <p className="text-sm">
    Específicamente, <strong>proveedores externos</strong>, incluidos Google y Amazon, 
    utilizan cookies para mostrar anuncios o rastrear conversiones basadas en sus visitas 
    anteriores a DealsWindfall. Usted puede optar por excluirse de la publicidad personalizada 
    visitando la configuración de su navegador o los portales de privacidad respectivos de 
    los minoristas.
  </p>
</section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">3. Contacto</h2>
            <p className="text-base mb-4">
              Para consultas de privacidad, visite nuestro portal:
              <br />
              <a href="https://www.dealswindfall.com/contact" className="text-blue-600 underline font-medium">
                https://www.dealswindfall.com/contact
              </a>
            </p>
          </section>

          <div className="h-20 w-full" aria-hidden="true"></div>
        </>
      )}
    </div>
  );
}