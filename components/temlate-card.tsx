import { IndianRupee } from "lucide-react";

interface TemplateCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  onPurchase: (templateId: number) => void;
  isPurchased: boolean;
}

export function TemplateCard({
  id,
  name,
  description,
  price,
  category,
  imageUrl,
  onPurchase,
  isPurchased,
}: TemplateCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/30 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">
          Template Image: {name}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
            {category}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex text-xl font-bold text-green-600 dark:text-green-400">
            ₹ {price}
          </div>
          <button
            onClick={() => onPurchase(id)}
            disabled={isPurchased}
            className={`px-4 py-2 rounded-md ${
              isPurchased
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white dark:text-gray-300"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
            }`}
          >
            {isPurchased ? "Purchased" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}