"use client";

import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function PaymentInfoCard() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <Card className="p-6 hidden lg:block">
        <p className="text-sm text-muted-foreground">Loading user info...</p>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="p-6 hidden lg:block">
        <h2 className="text-xl font-semibold mb-2">Payment Information</h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to proceed with your purchase.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 hidden lg:block space-y-6">
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            alt="User Avatar"
            width={56}
            height={56}
            className="rounded-full border"
          />
        )}

        {/* User Details */}
        <div>
          <h2 className="text-lg font-semibold">{user.fullName}</h2>
          <p className="text-sm text-muted-foreground">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-xl font-semibold">Payment Information</h3>
        <p className="text-sm text-muted-foreground">
          Your payment will be processed securely. By completing this purchase,
          you agree to our{" "}
          <a href="/terms" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </Card>
  );
}
