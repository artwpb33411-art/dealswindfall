"use client";
import { Home, Flame, Store, Info, Shield, Mail, FileText } from "lucide-react";

export default function MobileBottomNav({
  onHome,
  onHotDeals,
  onStores,
  onAbout,
  onPrivacy,
  onContact,
  active,
}: any) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-white/80 backdrop-blur-md
        border-t border-gray-200
        flex justify-around items-center
        h-14
        md:hidden
        z-40
      "
    >

      {/* Home */}
      <button
        onClick={onHome}
        className={`navbtn ${active === "home" ? "text-blue-600" : "text-gray-600"}`}
      >
        <Home size={22} />
      </button>

      {/* HOT DEALS (GLOWING FLAME) */}
      <button
        onClick={onHotDeals}
        className={`navbtn ${active === "hot" ? "text-blue-600" : "text-gray-600"}`}
      >
        <Flame
          size={24}
          className="animate-[flame-glow_1.4s_ease-in-out_infinite]"
        />
      </button>

      {/* About */}
      <button
        onClick={onAbout}
        className={`navbtn ${active === "about" ? "text-blue-600" : "text-gray-600"}`}
      >
        <Info size={22} />
      </button>

      {/* Privacy */}
      <button
        onClick={onPrivacy}
        className={`navbtn ${active === "privacy" ? "text-blue-600" : "text-gray-600"}`}
      >
        <Shield size={22} />
      </button>

      {/* Blog */}
      <button
        onClick={() => (window.location.href = "/blog")}
        className={`navbtn ${active === "blog" ? "text-blue-600" : "text-gray-600"}`}
      >
        <FileText size={22} />
      </button>

      {/* Contact */}
      <button
        onClick={onContact}
        className={`navbtn ${active === "contact" ? "text-blue-600" : "text-gray-600"}`}
      >
        <Mail size={22} />
      </button>

    </nav>
  );
}
