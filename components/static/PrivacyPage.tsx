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
    <div className="p-6 text-gray-700 leading-relaxed">
      {lang === "en" ? (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            Privacy Policy
          </h1>

          <p className="text-[14px] mb-2">
            Your privacy is very important to us. At <strong>DealsWindfall</strong>, we
            are committed to protecting your personal information and ensuring transparency
            in how we collect, use, and safeguard data.
          </p>

          <p className="text-[14px] mb-2">
            We may collect limited information such as your email address or browsing
            behavior to enhance your experience on our site. This data is used solely for
            providing personalized deals, improving our platform, and maintaining security.
          </p>

          <p className="text-[14px] mb-2">
            We do not sell or share your personal information with third parties. Any
            analytics or cookies used are solely for performance optimization and ensuring
            relevant content is displayed.
          </p>

          <p className="text-[14px] mb-2">
            By using our site, you agree to our privacy practices as outlined here. You
            can contact us anytime for questions or data removal requests.
          </p>
		  
		  <p className="text-[14px] mb-2">
            DealsWindfall does not store any Facebook user data.
If you want to request data deletion, please use our contact form:
https://www.dealswindfall.com/contact
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-blue-600 mb-3">
            Política de Privacidad
          </h1>

          <p className="text-[14px] mb-2">
            Su privacidad es muy importante para nosotros. En <strong>DealsWindfall</strong>,
            estamos comprometidos a proteger su información personal y garantizar la
            transparencia en cómo recopilamos, utilizamos y protegemos sus datos.
          </p>

          <p className="text-[14px] mb-2">
            Podemos recopilar información limitada, como su dirección de correo electrónico
            o comportamiento de navegación, para mejorar su experiencia en nuestro sitio.
            Estos datos se utilizan únicamente para ofrecer ofertas personalizadas, mejorar
            nuestra plataforma y mantener la seguridad.
          </p>

          <p className="text-[14px] mb-2">
            No vendemos ni compartimos su información personal con terceros. Cualquier
            análisis o cookie utilizada es únicamente para la optimización del rendimiento
            y asegurar que se muestre contenido relevante.
          </p>

          <p className="text-[14px] mb-2">
            Al utilizar nuestro sitio, usted acepta nuestras prácticas de privacidad tal
            como se describen aquí. Puede contactarnos en cualquier momento para hacer
            preguntas o solicitar la eliminación de sus datos.
          </p>
		  
		  <p className="text-[14px] mb-2">
            DealsWindfall no almacena ningún dato de usuario de Facebook.
Si desea solicitar la eliminación de datos, utilice nuestro formulario de contacto:
https://www.dealswindfall.com/contact

          </p>
        </>
      )}
    </div>
  );
}
