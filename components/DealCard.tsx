interface DealCardProps {
  title: string;
  price: string;
  link: string;
  votes: number;
  image: string;
}

export default function DealCard({ title, price, link, votes, image }: DealCardProps) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
      <img src={image} alt={title} className="rounded-lg object-cover h-40 w-full mb-3" />
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-blue-600 font-bold mb-2">{price}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-gray-500 text-sm">{votes} 👍</span>
        <a
          href={link}
          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
        >
          View Deal
        </a>
      </div>
    </div>
  );
}
