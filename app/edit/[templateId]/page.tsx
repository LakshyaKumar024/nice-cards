"use client";

import { use, useEffect } from "react";
import PDFEditor from "@/components/pdf-editor";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "@/app/fonts.css"; // Import custom fonts

interface EditPDFPageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default function EditPDFPage({ params }: EditPDFPageProps) {
  const { templateId } = use(params);
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for user to load
    if (!userLoaded) {
      return;
    }

    // Wait for templateId
    if (!templateId) {
      return;
    }

    const checkUser = async () => {
      try {
        const res = await fetch(`/api/design/${templateId}`, {
          method: "POST",
          body: JSON.stringify({ userId: user?.id }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          toast.error("Failed to fetch template info.");
          console.log("Fetch not ok. Status:", res.status);
          router.push("/404");
          return;
        }

        const data = await res.json();

        if (!data.data?.hasPurchased) {
          toast.error("You do not have access to edit this template.");
          console.log("User has NOT purchased template", templateId);
          router.push("/404");
          return;
        }
      } catch (error) {
        console.error("Error checking access:", error);
        toast.error("An error occurred while checking access.");
        router.push("/404");
      }
    };

    checkUser();
  }, [templateId, user?.id, userLoaded, router]);

  return <PDFEditor pdfId={templateId} />;
}
