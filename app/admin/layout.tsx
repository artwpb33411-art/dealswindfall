"use client";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Mark body as admin page so global CSS allows scrolling
    document.body.classList.add("admin-page");
    return () => document.body.classList.remove("admin-page");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {children}
    </div>
  );
}
