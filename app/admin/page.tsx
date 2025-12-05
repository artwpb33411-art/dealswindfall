"use client";
import BlogManager from "@/components/admin/BlogManager";
import ExportDeals from "@/components/admin/ExportDeals";
import { useState } from "react";
import DealsForm from "@/components/admin/DealsForm";
import CatalogForm from "@/components/admin/CatalogForm";
import CouponForm from "@/components/admin/CouponForm";
import DealsList from "@/components/admin/DealsList";
import CatalogList from "@/components/admin/CatalogList";
import CouponList from "@/components/admin/CouponList";
import BulkUploadDeals from "@/components/admin/BulkUploadDeals";
import SeasonalEventsManager from "@/components/admin/SeasonalEventsManager";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AutoPublishSettings from "@/components/admin/AutoPublishSettings";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("deals");

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      {/* Logout Button */}
      <button
        onClick={async () => {
          await fetch("/api/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="absolute top-4 right-4 text-sm text-gray-600 hover:text-red-600"
      >
        Logout
      </button>

      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-gray-700 mb-6">
        Manage your <strong>Deals</strong>, <strong>Catalogs</strong>, and{" "}
        <strong>Coupons</strong>.
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6">
        {[
          { id: "deals", label: "🔥 Deals" },
          { id: "catalogs", label: "🗂️ Catalogs" },
          { id: "coupons", label: "🎟️ Coupons" },
		     { id: "events", label: "📅 Seasonal Events" }, // ✅ new
			  { id: "analytics", label: "📊 Analytics" }, // ✅ new
			  { id: "settings", label: "⚙️ Settings" },
        { id: "blog", label: "📝 Blog" }


        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-lg font-medium border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            } transition`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "deals" && (
  <div>
    <DealsForm />

    {/* Grid layout for Bulk Upload + Export */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <BulkUploadDeals />
        <a
          href="/templates/deals-template.xlsx"
          download
          className="ml-1 text-blue-600 underline text-sm hover:text-blue-800"
        >
          Download Template
        </a>
      </div>

      <ExportDeals />
    </div>

    {/* Deals List */}
    <div className="mt-8">
      <DealsList />
    </div>
  </div>
)}

      {activeTab === "catalogs" && (
  <div>
    <CatalogForm />
    <CatalogList />
  </div>
)}

     {activeTab === "coupons" && (
  <div>
    <CouponForm />
    <CouponList />
  </div>
)}
{activeTab === "events" && (
        <div>
          <SeasonalEventsManager />
        </div>
      )}

{activeTab === "analytics" && (
        <div>
          <AdminAnalytics />
        </div>
      )}
	  
	  
	  {activeTab === "settings" && (
        <div>
          <AutoPublishSettings />
        </div>
      )}

      {activeTab === "blog" && (
  <div>
    <BlogManager />
  </div>
)}

	  
	  
      </div>
  );
}





/* ------------------ Reusable Styles ------------------ */
function Input({ placeholder }: { placeholder: string }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}
