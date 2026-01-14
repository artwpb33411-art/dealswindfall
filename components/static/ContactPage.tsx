"use client";

import { useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useLangStore } from "@/lib/languageStore";

export default function ContactPage() {
  // Always initialize states first — BEFORE any early return
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Language system
  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  // SAFE: Hooks already executed, so early return is allowed.
  if (!hydrated) return null;

  // ------------------- SUCCESS MESSAGE -------------------
  if (sent) {
    return (
      <div className="px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-3">
          {lang === "en"
            ? "Message Sent Successfully!"
            : "¡Mensaje enviado con éxito!"}
        </h2>
        <p className="text-gray-600">
          {lang === "en"
            ? "We will get back to you shortly."
            : "Nos pondremos en contacto con usted pronto."}
        </p>
      </div>
    );
  }

  // ------------------- FORM HANDLERS -------------------
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.reason || !form.message) {
      setError(
        lang === "en"
          ? "Please fill all required fields."
          : "Por favor complete todos los campos obligatorios."
      );
      return;
    }

    if (!captchaToken) {
      setError(
        lang === "en"
          ? "Please complete the CAPTCHA."
          : "Por favor complete el CAPTCHA."
      );
      return;
    }

    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({ ...form, captchaToken }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(lang === "en" ? data.error : "Hubo un error al enviar el mensaje.");
    } else {
      setSent(true);
    }
  };

  // ------------------- FORM UI -------------------
  return (
    <div className="overflow-y-auto custom-scroll min-h-[calc(100vh-56px)] px-6 py-6 pb-40">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {lang === "en" ? "Contact Us" : "Contáctanos"}
      </h1>

      <p className="text-gray-600 mb-6">
        {lang === "en"
          ? "Have a suggestion, business inquiry, or found an amazing deal? Fill out the form below and we’ll reply promptly."
          : "¿Tienes una sugerencia, consulta comercial o encontraste una oferta increíble? Completa el formulario y te responderemos pronto."}
      </p>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Full Name" : "Nombre completo"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>

        {/* Company */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Company" : "Compañía"}
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            className="input mt-1"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Phone" : "Teléfono"}
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input mt-1"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Reason" : "Motivo"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            className="input mt-1"
          >
            <option value="">
              {lang === "en" ? "Select a reason…" : "Seleccione un motivo…"}
            </option>
            <option value="general">
              {lang === "en" ? "General Question" : "Pregunta general"}
            </option>
            <option value="suggest-deal">
              {lang === "en" ? "Suggest a Deal" : "Sugerir una oferta"}
            </option>
            <option value="business">
              {lang === "en" ? "Business Proposal" : "Propuesta comercial"}
            </option>
            <option value="partnership">
              {lang === "en" ? "Partnership Inquiry" : "Consulta de colaboración"}
            </option>
            <option value="feedback">
              {lang === "en" ? "Feedback" : "Comentarios"}
            </option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Message" : "Mensaje"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            rows={6}
            onChange={handleChange}
            required
            className="input mt-1"
          />
        </div>

        {/* hCaptcha */}
        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken("")}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-md font-semibold"
        >
          {loading
            ? lang === "en"
              ? "Sending…"
              : "Enviando…"
            : lang === "en"
            ? "Submit"
            : "Enviar"}
        </button>

        <p className="text-[10px] text-gray-400 mt-2 text-center">
  {lang === "en" 
    ? "By submitting, you agree to our Privacy Policy. We do not share your data with third parties." 
    : "Al enviar, usted acepta nuestra Política de Privacidad. No compartimos sus datos con terceros."}
</p>
      </form>
    </div>
  );
}
