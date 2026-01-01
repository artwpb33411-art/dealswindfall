"use client";

export default function ShareDealButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Deal link copied");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share deal"
      title="Share deal"
      className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
    >
      {/* Classic share icon (inline SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 000-1.39l7.02-4.11A2.99 2.99 0 0018 7.91a3 3 0 10-3-3c0 .23.03.45.08.66L8.06 9.68a3 3 0 100 4.63l7.02 4.11c-.05.2-.08.41-.08.63a3 3 0 103-3z" />
      </svg>
    </button>
  );
}
