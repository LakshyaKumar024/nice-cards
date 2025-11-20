import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import TemplateCard from "./templateCard";
import { useState } from "react";

interface TemplateData {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  name: string;
  designer: string;
  image: string;
  // Add other properties that templateData might have
  id?: string;
  description?: string;
}

interface OrderSummaryProps {
  templateData: TemplateData;
  handelPayment:()=>void;
  isPurchasing: boolean;
}

const OrderSummary = ({ isPurchasing, templateData, handelPayment}: OrderSummaryProps) => {
    const [marketingConsent, setMarketingConsent] = useState<boolean>(false);

    return (
        <Card className="p-6 lg:sticky lg:top-8 space-y-6 shadow-md">
            <div>
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <TemplateCard template={templateData} />
            </div>

            <Separator />

            {/* Pricing Breakdown */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{templateData.originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-success">-₹{templateData.discount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                        ₹{templateData.finalPrice.toFixed(2)}
                    </span>
                </div>
            </div>

            <Separator />

            {/* Marketing Consent */}
            <div className="flex items-start space-x-3">
                <Checkbox
                    id="marketing"
                    checked={marketingConsent}
                    onCheckedChange={(checked: boolean | "indeterminate") => setMarketingConsent(checked as boolean)}
                    className="mt-0.5"
                />
                <Label
                    htmlFor="marketing"
                    className="text-sm text-muted-foreground leading-tight cursor-pointer"
                >
                    I would like to receive news, surveys, and special offers from Nice Card and partners.
                </Label>
            </div>

            {/* Place Order Button */}
            <Button
            onClick={handelPayment}
                size="lg"
                disabled={isPurchasing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-12"
            >
                {isPurchasing ? "Placing Order...":"PLACE ORDER"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                </a>
            </p>
        </Card>
    );
};

export default OrderSummary;