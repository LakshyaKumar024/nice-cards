"use client";

import { use, useEffect, useState } from "react";
import PDFEditor from "@/components/pdf-editor";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "@/app/fonts.css"; // Import custom fonts
import { Info, X } from "lucide-react";
import { Overlay } from "@/lib/types";

interface EditPDFPageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default function EditPDFPage({ params }: EditPDFPageProps) {
  const { templateId } = use(params);
  const { user, isLoaded: userLoaded } = useUser();
  const [pdfFName, setPdfFName] = useState<string | null>(null);
  const [userContent, setUserContent] = useState<Overlay[] | []>(null);
  const [defaultTemplateDesign, setDefaultTemplateDesign] = useState<Overlay[] | []>(null);
  const [showNote, setShowNote] = useState(true);

  const router = useRouter();

  // Check if user is admin from Clerk publicMetadata
  const isAdmin = user?.publicMetadata?.role === "admin";

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
        //its pdf filename
        setPdfFName(data.data.pdf);
        
        const userOverlays = data.data.savedTemplates[0]?.content 
          ? JSON.parse(data.data.savedTemplates[0].content) 
          : [];
        const defaultOverlays = data.data.defaultDesign 
          ? JSON.parse(data.data.defaultDesign) 
          : [];
        
        setDefaultTemplateDesign(defaultOverlays);
        setUserContent(userOverlays || defaultOverlays || []);


      } catch (error) {
        console.error("Error checking access:", error);
        toast.error("An error occurred while checking access.");
        router.push("/404");
      }
    };

    checkUser();
  }, [templateId, user?.id, userLoaded, router]);

  return (
    <>
      <div className="h-screen flex flex-col">
        {showNote && (
          <div
            className="
    border 
    border-teal-200 
    bg-teal-50 
    dark:border-zinc-700 
    dark:bg-zinc-900 
    m-1 rounded-md px-3 py-2
  "
          >
            <div className="flex items-center gap-2 w-full">
              <Info className="h-3 w-3 text-teal-600 shrink-0 dark:text-primary" />

              <p className="text-teal-900 dark:text-zinc-200 text-sm flex-1">
                <strong>Note: </strong>
                For Hindi text copied from <strong>Google Translate</strong>, we
                recommend using <strong>Unicode Hindi</strong> for best results.
              </p>

              <button
                className="
        h-4 w-4 p-0 
        text-teal-700 dark:text-zinc-300 
        hover:text-teal-800 dark:hover:text-white 
        shrink-0 flex items-center justify-center cursor-pointer
      "
                onClick={() => setShowNote(false)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <PDFEditor
            templateId={templateId}
            userId={user?.id}
            pdfFName={pdfFName}
            defaultOverlays={userContent}
            defaultTemplateDesign={defaultTemplateDesign}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </>
  );
}
