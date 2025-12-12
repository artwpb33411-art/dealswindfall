"use client";

import { useState } from "react";

// Components
import DealsForm from "@/components/admin/DealsForm";
import DealsList from "@/components/admin/DealsList";
import ExportDeals from "@/components/admin/ExportDeals";
import BulkUploadDeals from "@/components/admin/BulkUploadDeals";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import SeasonalEventsManager from "@/components/admin/SeasonalEventsManager";

import AutoPublishPanel from "@/components/admin/AutoPublishPanel"; // ✔ Auto Publish Dashboard (Status, Platforms, Manual Actions)
import AutoPublishSettings from "@/components/admin/AutoPublishSettings"; // ✔ Only in Settings tab

import SchedulerStatusWidget from "@/components/admin/SchedulerStatusWidget"; // ✔ Only in Settings tab
import BlogManager from "@/components/admin/BlogManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("deals");

  const tabs = [
    { id: "deals", label: "🔥 Deals" },
    { id: "events", label: "📅 Seasonal Events" },
    { id: "autopublish", label: "🕒 Auto Publish" }, // ✔ Operational dashboard
    { id: "settings", label: "⚙️ Settings" },       // ✔ Configuration
    { id: "blog", label: "📝 Blog" },
      { id: "analytics", label: "📊 Analytics" }, // ✅ new
  ];

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
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">Manage your website content.</p>

      {/* TAB BUTTONS */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-lg font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT SECTIONS ------------------------------------------------- */}

      {/* DEALS TAB */}
      {activeTab === "deals" && (
        <div>
          <DealsForm />

          {/* Bulk Upload + Export */}
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

      {/* SEASONAL EVENTS TAB */}
      {activeTab === "events" && (
        <div>
          <SeasonalEventsManager />
        </div>
      )}

      {/* AUTO PUBLISH TAB */}
      {activeTab === "autopublish" && (
        <div>
          <AutoPublishPanel />
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Settings UI */}
          <AutoPublishSettings />

          {/* Scheduler Monitoring */}
          <SchedulerStatusWidget />
        </div>
      )}

      {/* BLOG TAB */}
      {activeTab === "blog" && (
        <div>
          <BlogManager />
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <AdminAnalytics />
        </div>
      )}

    </div>
  );
}
