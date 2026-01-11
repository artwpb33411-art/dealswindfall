"use client";

import { useLangStore } from "@/lib/languageStore";
import { useEffect } from "react";

export default function PrivacyPage() {
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
            Privacy Policy & Affiliate Disclosure
          </h1>

          {/* Privacy */}
          <p className="text-[14px] mb-2">
            Your privacy is very important to us. At <strong>DealsWindfall</strong>, we are committed
            to protecting your personal information and being transparent about how our platform
            operates.
          </p>

          <p className="text-[14px] mb-2">
            We may collect limited, non-personal information such as browser type, device information,
            pages visited, and referral data to improve site performance and user experience.
            If you voluntarily contact us, we may receive your email address solely to respond
            to your inquiry.
          </p>

          <p className="text-[14px] mb-2">
            We do not sell, rent, or trade your personal information to third parties.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall may use cookies or similar technologies for analytics, performance
            optimization, and security purposes.
          </p>

          {/* Affiliate Disclosure */}
          <h2 className="text-lg font-semibold mt-4 mb-2">
            Affiliate Disclosure
          </h2>

          <p className="text-[14px] mb-2">
            DealsWindfall is an independent deal discovery and informational website.
            We do not sell products directly.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall <strong>may apply for or participate in affiliate marketing programs</strong>,
            including the Amazon Services LLC Associates Program. If approved in the future,
            some product links on this site may become affiliate links.
          </p>

          <p className="text-[14px] mb-2">
            This means that if you click on a product link and make a purchase on a third-party
            retailer’s website, DealsWindfall <strong>may earn a commission</strong> at no additional
            cost to you.
          </p>

          <p className="text-[14px] mb-2">
            All purchases are completed on third-party websites. Product prices, availability,
            shipping, and return policies are determined solely by the retailer.
          </p>

          {/* Social & Contact */}
          <h2 className="text-lg font-semibold mt-4 mb-2">
            Social Platforms & Data Requests
          </h2>

          <p className="text-[14px] mb-2">
            DealsWindfall does not store Facebook user data. If you wish to request data
            deletion or have privacy-related questions, please contact us:
            <br />
            <a
              href="https://www.dealswindfall.com/contact"
              className="text-blue-600 underline"
            >
              https://www.dealswindfall.com/contact
            </a>
          </p>

          <p className="text-[14px] mt-4">
            By using DealsWindfall, you agree to this Privacy Policy and Affiliate Disclosure.
            This page may be updated periodically to reflect changes in legal or business
            requirements.
          </p>

          <p className="text-[14px] mt-4">
            <br></br>
          </p>
         
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            Política de Privacidad y Divulgación de Afiliados
          </h1>

          {/* Privacidad */}
          <p className="text-[14px] mb-2">
            Su privacidad es muy importante para nosotros. En <strong>DealsWindfall</strong>,
            estamos comprometidos a proteger su información personal y a ser transparentes
            sobre cómo funciona nuestra plataforma.
          </p>

          <p className="text-[14px] mb-2">
            Podemos recopilar información limitada y no personal, como tipo de navegador,
            dispositivo, páginas visitadas y datos de referencia, para mejorar el rendimiento
            del sitio y la experiencia del usuario.
          </p>

          <p className="text-[14px] mb-2">
            No vendemos ni compartimos su información personal con terceros.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall puede utilizar cookies o tecnologías similares con fines de análisis
            y seguridad.
          </p>

          {/* Afiliados */}
          <h2 className="text-lg font-semibold mt-4 mb-2">
            Divulgación de Afiliados
          </h2>

          <p className="text-[14px] mb-2">
            DealsWindfall es un sitio web independiente de descubrimiento de ofertas y no
            vende productos directamente.
          </p>

          <p className="text-[14px] mb-2">
            DealsWindfall <strong>puede solicitar o participar en programas de marketing de afiliados</strong>,
            incluido el Programa de Afiliados de Amazon Services LLC. Si es aprobado en el futuro,
            algunos enlaces de productos pueden convertirse en enlaces de afiliados.
          </p>

          <p className="text-[14px] mb-2">
            Esto significa que, si hace clic en un enlace de producto y realiza una compra
            en un sitio web de terceros, DealsWindfall <strong>podría recibir una comisión</strong>
            sin costo adicional para usted.
          </p>

          <p className="text-[14px] mb-2">
            Todas las compras se realizan en sitios web de terceros.
          </p>

          {/* Social */}
          <h2 className="text-lg font-semibold mt-4 mb-2">
            Plataformas Sociales y Solicitudes de Datos
          </h2>

          <p className="text-[14px] mb-2">
            DealsWindfall no almacena datos de usuarios de Facebook. Para solicitar la
            eliminación de datos o hacer preguntas sobre privacidad, utilice nuestro
            formulario de contacto:
            <br />
            <a
              href="https://www.dealswindfall.com/contact"
              className="text-blue-600 underline"
            >
              https://www.dealswindfall.com/contact
            </a>
          </p>

          <p className="text-[14px] mt-4">
            Al utilizar DealsWindfall, usted acepta esta Política de Privacidad y Divulgación
            de Afiliados.
          </p>
           <p className="text-[14px] mt-4">
            <br></br>
          </p>
         
        </>
      )}
    </div>
  );
}
