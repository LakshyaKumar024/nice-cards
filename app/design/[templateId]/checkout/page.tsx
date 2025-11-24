"use client";
import OrderSummary from "@/components/checkout/orderSummary";
import PaymentInfoCard from "@/components/paymentInfocard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [template, setTemplate] = useState<any>({});
  useEffect(() => {
    const getTemplate = async () => {
      const template = await fetch(`/api/design/${templateId}`, {
        method: "POST",
        body: JSON.stringify({ userId: user?.id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await template.json();
      if (data.data.hasPurchased) {
        toast.info("This template is already purchased.");
        return router.push(`/edit/${templateId}`);
      }
      setTemplate(data.data);
    };
    getTemplate();
  }, [user, templateId, router]);

  if (!template.uuid)
    return (
      <div className="flex items-center justify-center h-screen w-full text-3xl font-semibold text-muted-foreground animate-pulse">
        Loading...
      </div>
    );

  const templateData = {
    name: template.name,
    designer: "Nice Card",
    image: `${template.image}`,
    originalPrice: Number(template.price),
    discount: 0,
    finalPrice: Number(template.price),
  };

  const handlePayment = async () => {
    setIsPurchasing(true);
    // For free
    if (Number(template.price) === 0) {
      const res = await fetch("/api/order/verify/free", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          templateId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Template purchased successfully!");
        router.push(`/edit/${templateId}`);
      } else {
        toast.error(data.message || "Failed to purchase template");
      }
    }

    // For Paid
    if (Number(template.price) > 0) {
      const res = await fetch("/api/order", {
        method: "POST",
        body: JSON.stringify({
          productId: templateId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        order_id: data.data.razorpay.id,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          const res = await fetch("/api/order/verify", {
            method: "POST",
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (data.isOk) {
            // do whatever page transition you want here as payment was successful
            toast.success("Payment completed", {
              description:
                "Your transaction was verified and processed successfully.",
            });
            router.push(`/edit/${templateId}`);
          } else {
            toast.error("Verification unsuccessful", {
              duration: 8000,
              description:
                "We were unable to confirm your transaction. If you were charged, please reach out to support.",
            });
          }
          setIsPurchasing(false);
        },
        modal: {
          ondismiss: () => {
            setIsPurchasing(false);
            toast.error("Payment not completed", {
              duration: 8000,
              description:
                "You exited the payment flow before finishing the transaction.",
            });
          },
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
    }
  };

  const handleBack = () => router.push(`/design/${templateId}`);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 sm:mb-6 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Template</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Column - Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-primary rounded-full" />
              <div className="flex-1 h-1 bg-primary rounded-full" />
              <div className="flex-1 h-1 bg-primary rounded-full" />
            </div>

            {/* Checkout Header */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Checkout
              </h1>
              <p className="text-lg text-muted-foreground">
                Review and Place Order
              </p>
            </div>

            {/* Info Card */}
            <Card className="bg-[hsl(var(--info-card))] border-border p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    Verify your information and click Place Order.
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    After placing your order, you&apos;ll receive instant access
                    to download your digital invitation template. You can
                    customize it using your favorite design software and print
                    as many copies as you need.
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Details Section */}
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">
                        Digital Template License
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lifetime personal use
                      </p>
                    </div>
                    <p className="font-semibold">Included</p>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">
                        Customization Rights
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Edit text, colors, and layout
                      </p>
                    </div>
                    <p className="font-semibold">Included</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">
                        File Formats
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, JPG, and SVG files
                      </p>
                    </div>
                    <p className="font-semibold">Included</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Info - Desktop only */}
            <PaymentInfoCard />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              templateData={templateData}
              handelPayment={handlePayment}
              isPurchasing={isPurchasing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
