"use client";

import Link from "next/link";

export default function OpenDealPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full text-center space-y-5">
        <h1 className="text-lg font-semibold">
          Open Deal in Browser
        </h1>

        <p className="text-sm text-gray-500">
          Some social apps use built-in browsers that may not load store
          pages correctly. For the best experience, continue in your browser.
        </p>

        {/* PRIMARY ACTION */}
        <Link
          href={`/go/${params.id}?force=1`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          Open Deal
        </Link>

        {/* SECONDARY CTA */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">
            Prefer browsing deals directly?
          </p>

          <Link
            href="/"
            className="block w-full py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
          >
            Visit DealsWindfall.com
          </Link>
        </div>
      </div>
    </div>
  );
}
