"use client";

import Link from "next/link";

export default function OpenDealPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-lg font-semibold">
          Open Deal in Browser
        </h1>

        <p className="text-sm text-gray-500">
          For best experience, please open this deal in your
          browser.
        </p>

        <Link
          href={`/go/${params.id}?force=1`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          Open Deal
        </Link>
      </div>
    </div>
  );
}
