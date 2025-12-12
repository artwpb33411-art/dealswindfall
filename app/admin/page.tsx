"use client";

import { useState } from "react";


import AutoPublishInventory from "@/components/admin/AutoPublishInventory";
import DealsForm from "@/components/admin/DealsForm";
import DealsList from "@/components/admin/DealsList";
import ExportDeals from "@/components/admin/ExportDeals";
import BulkUploadDeals from "@/components/admin/BulkUploadDeals";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import SeasonalEventsManager from "@/components/admin/SeasonalEventsManager";

import AutoPublishPanel from "@/components/admin/AutoPublishPanel";
import AutoPublishSettings from "@/components/admin/AutoPublishSettings";
import SchedulerStatusWidget from "@/components/admin/SchedulerStatusWidget";
import BlogManager from "@/components/admin/BlogManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("deals");

  const tabs = [
    { id: "deals", label: "🔥 Deals" },
    { id: "events", label: "📅 Seasonal Events" },
    { id: "analytics", label: "📊 Analytics" },
    { id: "autopublish", label: "🕒 Auto Publish" },
    { id: "settings", label: "⚙️ Settings" },
    { id: "blog", label: "📝 Blog" },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">

      {/* Logout Button */}
      <button
        onClick={async () => {
          await fetch("/api/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="absolute top-4 right-4 text-sm px-3 py-1 rounded-md 
                   text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold text-blue-600 mb-2">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">Manage your website content.</p>

      {/* Tabs */}
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

    {/* Content */}
<div className="overflow-y-auto max-h-[calc(100vh-150px)] pr-1">
  {activeTab === "deals" && (
    <div>
      {/* Top grid: left = form, right = inventory dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Deals form + bulk/upload/export */}
        <div>
          <DealsForm />

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
        </div>

        {/* RIGHT: Auto-Publish Inventory Dashboard */}
        <div>
          <AutoPublishInventory />
        </div>
      </div>

      {/* Deals list (full width under the grid) */}
      <div className="mt-8">
        <DealsList />
      </div>
    </div>
  )}

  {/* other tabs (events, settings, etc.) go here... */}


        {activeTab === "events" && <SeasonalEventsManager />}

        {activeTab === "analytics" && <AdminAnalytics />}

        {activeTab === "autopublish" && <AutoPublishPanel />}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <AutoPublishSettings />
            <SchedulerStatusWidget />
          </div>
        )}

        {activeTab === "blog" && <BlogManager />}

      </div>
    </div>
  );
}
