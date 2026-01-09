"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { AdminUser } from "@/lib/adminAuth";
import { useRouter } from "next/navigation";
// Admin components
import PublishingRules from "@/components/admin/PublishingRules";
import AutoPublishInventory from "@/components/admin/AutoPublishInventory";
import DealsForm from "@/components/admin/DealsForm";
import DealsList from "@/components/admin/DealsList";
import ExportDeals from "@/components/admin/ExportDeals";
import BulkUploadDeals from "@/components/admin/BulkUploadDeals";
import AdminAnalyticsV2 from "@/components/admin/AdminAnalyticsV2";
import SeasonalEventsManager from "@/components/admin/SeasonalEventsManager";
import AutoPublishPanel from "@/components/admin/AutoPublishPanel";
import AutoPublishSettings from "@/components/admin/AutoPublishSettings";
import SchedulerStatusWidget from "@/components/admin/SchedulerStatusWidget";
import BlogManager from "@/components/admin/BlogManager";
import AdminUsersManager from "@/components/admin/AdminUsersManager";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminUI() {
  // 🔐 Admin session state
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
const router = useRouter();
async function handleLogout() {
  try {
    if (admin) {
      await fetch("/api/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "logout",
        }),
      });
    }
  } finally {
      sessionStorage.removeItem("admin_login_logged"); // ✅ reset
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }
}


  // 🧠 UI state
  const [activeTab, setActiveTab] = useState("deals");

  // 🔄 Load admin session client-side
  useEffect(() => {
    async function loadAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setAdmin(null);
          return;
        }

        const res = await fetch("/api/admin/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        console.log("🧪 /api/admin/me response:", res.status, json);

        if (!res.ok) {
          setAdmin(null);
        } else {
          setAdmin(json.admin);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  // ⏳ Loading state
  if (loading) {
    return <div className="p-6 text-gray-500">Loading admin session…</div>;
  }

  // 🚫 Unauthorized
  if (!admin) {
    return <div className="p-6 text-red-500">Not authorized</div>;
  }

  // 🔐 All admins see all tabs
  const ALL_TABS = [
    { id: "deals", label: "🔥 Deals" },
    { id: "publishing", label: "📈 Publishing Rules" },
    { id: "analytics", label: "📊 Analytics" },
    { id: "autopublish", label: "🕒 Auto Publish" },
    { id: "settings", label: "⚙️ Settings" },
    { id: "events", label: "📅 Seasonal Events" },
    { id: "blog", label: "📝 Blog" },
    { id: "admins", label: "👥 Admins" },

  ] as const;

  const tabs = ALL_TABS;

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">
        Admin Dashboard
      </h1>

     <div className="flex items-center justify-between mb-6">
  <p className="text-gray-700">
    Logged in as <strong>Admin</strong>
  </p>

  <button
    onClick={handleLogout}
    className="text-sm text-red-600 hover:text-red-700 font-medium"
  >
    Logout
  </button>
</div>


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

{activeTab === "publishing" && <PublishingRules />}
        {activeTab === "analytics" && <AdminAnalyticsV2 />}
        {activeTab === "autopublish" && <AutoPublishPanel />}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <AutoPublishSettings />
            <SchedulerStatusWidget />
          </div>
        )}
        {activeTab === "admins" && admin.role === "owner" && (
 <AdminUsersManager currentRole={admin.role} />

)}

        {activeTab === "events" && <SeasonalEventsManager />}
        {activeTab === "blog" && <BlogManager />}

        
      </div>
    </div>
  );
}
