import Link from "next/link";
import Footer from "@/components/Footer";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Logo */}
      <header className="bg-white border-b">
  <div className="mx-auto max-w-6xl px-4 h-12 flex items-center">
    <a href="/" className="flex items-center">
      <img
        src="/dealswindfall-logoA.png"
        alt="DealsWindfall"
        className="h-6 w-auto"
      />
    </a>
  </div>
</header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
