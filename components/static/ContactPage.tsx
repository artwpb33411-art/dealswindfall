"use client";

import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function ContactPage() {
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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!form.name || !form.email || !form.reason || !form.message) {
      setError("Please fill all required fields.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
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
      setError(data.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-3">
          Message Sent Successfully!
        </h2>
        <p className="text-gray-600">We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto custom-scroll min-h-[calc(100vh-56px)] px-6 py-6 pb-40">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h1>

      <p className="text-gray-600 mb-6">
        Have a suggestion, business inquiry, or found an amazing deal?  
        Fill out the form below and we’ll reply promptly.
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
            Full Name <span className="text-red-500">*</span>
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
          <label className="text-sm font-medium text-gray-700">Company</label>
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
          <label className="text-sm font-medium text-gray-700">Phone</label>
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
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            className="input mt-1"
          >
            <option value="">Select a reason…</option>
            <option value="general">General Question</option>
            <option value="suggest-deal">Suggest a Deal</option>
            <option value="business">Business Proposal</option>
            <option value="partnership">Partnership Inquiry</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Message <span className="text-red-500">*</span>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-md font-semibold"
        >
          {loading ? "Sending…" : "Submit"}
        </button>
      </form>
    </div>
  );
}
