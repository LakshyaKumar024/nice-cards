import { Card } from "@/components/ui/card";
import Image from "next/image";

interface TemplateCardProps {
  template: {
    name: string;
    designer: string;
    image: string;
    originalPrice: number;
    discount: number;
    finalPrice: number;
  };
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <Card className="overflow-hidden border-border">
      <div className="flex gap-4 p-4">
        {/* Template Thumbnail */}
        <div className="flex-shrink-0">
          <Image
          width={100}
          height={100}
            src={template.image}
            alt={template.name}
            className="w-24 h-32 object-cover rounded-md shadow-sm"
          />
        </div>

        {/* Template Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1 line-clamp-2">
            {template.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            By {template.designer}
          </p>
          
          {/* Pricing */}
          <div className="space-y-1">
            {template.discount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs line-through text-muted-foreground">
                  ₹{template.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                  100% OFF
                </span>
              </div>
            )}
            <p className="text-lg font-bold text-foreground">
              ₹{template.finalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TemplateCard;