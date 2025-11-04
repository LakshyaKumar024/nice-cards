"use client";
import OrderSummary from "@/components/checkout/orderSummary";
import { Card } from "@/components/ui/card";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = use(params);

  const templateData = {
    name: "Elegant Floral Wedding Invitation",
    designer: "Nice Card",
    image: "/placeholder/image/design-aaa-21.jpg",
    originalPrice: 499.0,
    discount: 499.0,
    finalPrice: 10.0,
  };

  console.log("rpi---",);
  const handlePayment = async () => {
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
    console.log("DTTATAT ---- ", data);

    const paymentData = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      order_id: data.data.razorpay.id,
      handler: async () => {},
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = new (window as any).Razorpay(paymentData);
    payment.open();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
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
            <Card className="p-6 hidden lg:block">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment Information</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment will be processed securely. By completing this
                  purchase, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              templateData={templateData}
              handelPayment={handlePayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

