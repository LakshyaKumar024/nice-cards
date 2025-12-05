import { ArrowRight, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
interface TemplateCardProps {
  uuid: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isPurchased: boolean;
  onPurchase: (templateId: string) => void;
}

export function TemplateCard({
  uuid,
  name,
  description,
  price,
  category,
  imageUrl,
  isPurchased,
}: TemplateCardProps) {
  // Remove any extra quotes from the image URL
  const cleanImageUrl = imageUrl ? imageUrl.replace(/^["']|["']$/g, "") : "";
  const Router = useRouter();
  return (
    <Link href={`/design/${uuid}`} className="group h-full">
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative h-full flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden"
      >
        {price === 0 && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-linear-to-r from-green-500 to-emerald-600 px-3 py-1.5 rounded-full">
            <Gift className="h-4 w-4 text-white" />
            <span className="text-xs font-semibold text-white">Free</span>
          </div>
        )}

        <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {cleanImageUrl ? (
            <Image
              src={cleanImageUrl}
              alt={name}
              width={300}
              height={200}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="h-12 w-12 rounded-lg bg-border" />
              <span className="text-xs">Template Preview</span>
            </div>
          )}
        </div>

        <div className="flex flex-col grow p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">
              {name}
            </h3>
            <Badge
              variant="secondary"
              className="text-xs font-medium whitespace-nowrap shrink-0"
            >
              {category}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 grow">
            {description.length > 120
              ? description.slice(0, 120) + "..."
              : description}
          </p>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <div className="text-sm font-semibold">
              {price === 0 ? (
                <span className="text-green-600 dark:text-green-400">Free</span>
              ) : (
                <span className="text-foreground">₹ {price}</span>
              )}
            </div>

            <button
              onClick={() => Router.push(`/design/${uuid}`)}
              disabled={isPurchased}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isPurchased
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 group-hover:translate-x-0.5"
              }`}
            >
              {isPurchased ? "Purchased" : "View"}
              {!isPurchased && <ArrowRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
