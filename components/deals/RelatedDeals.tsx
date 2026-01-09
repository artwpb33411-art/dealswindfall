import Link from "next/link";

type RelatedDeal = {
  id: number;
  slug: string;
  title: string;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  store_name: string | null;
};

type Props = {
  deals: RelatedDeal[];
  currentDealId: number;
};

export default function RelatedDeals({ deals, currentDealId }: Props) {
  if (!deals || deals.length < 2) return null;

  return (
    <section className="mt-8">
      <h2 className="text-base font-medium text-slate-700 mb-3">
        Deals you may be interested in
      </h2>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {deals.slice(0, 5).map((deal) => (
          <RelatedDealCard
            key={deal.id}
            deal={deal}
            currentDealId={currentDealId}
          />
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex gap-4 pr-4">
          {deals.slice(0, 5).map((deal) => (
            <div key={deal.id} className="min-w-[70%]">
              <RelatedDealCard
                deal={deal}
                currentDealId={currentDealId}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function RelatedDealCard({
  deal,
  currentDealId,
}: {
  deal: RelatedDeal;
  currentDealId: number;
}) {
  const href = `/deals/${deal.id}-${deal.slug}?from=${currentDealId}`;

  return (
    <Link
      href={href}
      className="block border border-slate-200 rounded-lg bg-white hover:shadow-md transition"
    >
      {deal.image_url && (
        <img
          src={deal.image_url}
          alt={`${deal.title} deal`}
          className="w-full h-24 object-cover"
          loading="lazy"
        />
      )}

      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-1">
          {deal.title}
        </h3>

        <div className="flex items-center gap-2">
          {deal.price !== null && (
            <span className="text-sm font-semibold text-green-600">
              ${deal.price.toFixed(2)}
            </span>
          )}

          {deal.old_price !== null &&
            deal.price !== null &&
            deal.old_price > deal.price && (
              <span className="text-xs line-through text-gray-400">
                ${deal.old_price.toFixed(2)}
              </span>
            )}
        </div>

        {deal.store_name && (
          <p className="text-xs text-gray-500 mt-1">
            {deal.store_name}
          </p>
        )}
      </div>
    </Link>
  );
}
