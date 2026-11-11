"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as pdfjsLib from "pdfjs-dist";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";
import { toast } from "sonner";
import PDFEditor from "@/components/pdf-editor";
import { PDFUpload } from "@/components/pdf-upload";
import { loadPDFDocument } from "@/lib/pdf-utils";
import type { Overlay } from "@/lib/types";
import "@/app/fonts.css";

// Stable empty array reference so parent re-renders (e.g. closing banner) do not reset editor overlays
const EMPTY_OVERLAYS: Overlay[] = [];

interface CustomPdfEditClientProps {
  userId: string;
}

export default function CustomPdfEditClient({ userId }: CustomPdfEditClientProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedPdf, setProcessedPdf] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState(
    "Validating and preparing PDF..."
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(true);

  const isMountedRef = useRef(true);
  const activePdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(() => {
      setShowNote(false);
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      const pdfToDestroy = activePdfRef.current;
      activePdfRef.current = null;
      if (pdfToDestroy) {
        setTimeout(() => {
          pdfToDestroy.destroy?.().catch(() => {});
        }, 0);
      }
    };
  }, []);

  // Client-side guard if session signs out in another tab
  useEffect(() => {
    if (userLoaded && !user) {
      router.replace("/");
    }
  }, [userLoaded, user, router]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setSelectedFileName(file.name);
    setProcessingMessage("Validating PDF structure...");

    let loadedPdf: pdfjsLib.PDFDocumentProxy | null = null;

    try {
      // Quick signature check within first 1024 bytes per PDF spec
      const headerChunk = await file.slice(0, 1024).text();
      if (!headerChunk.includes("%PDF-")) {
        throw new Error("Invalid PDF file signature.");
      }

      if (!isMountedRef.current) return;
      setProcessingMessage("Processing PDF pages for editing...");

      loadedPdf = await loadPDFDocument(file);

      if (!loadedPdf || loadedPdf.numPages < 1) {
        throw new Error("The PDF contains no pages.");
      }

      // Warm up first page metadata so canvas renders immediately upon opening editor
      await loadedPdf.getPage(1);

      if (!isMountedRef.current) {
        loadedPdf.destroy?.().catch(() => {});
        return;
      }

      activePdfRef.current = loadedPdf;
      setUploadedFile(file);
      setProcessedPdf(loadedPdf);

      toast.success(
        `Loaded "${file.name}" (${loadedPdf.numPages} ${
          loadedPdf.numPages === 1 ? "page" : "pages"
        })`,
        {
          description: "Double-click anywhere on the PDF to add text.",
        }
      );
    } catch (err) {
      if (loadedPdf) {
        loadedPdf.destroy?.().catch(() => {});
      }
      if (!isMountedRef.current) return;

      console.error("Failed to process uploaded PDF:", err);
      const message =
        err instanceof Error && err.name === "PasswordException"
          ? "Password-protected PDFs are not supported."
          : err instanceof Error && err.message.includes("Invalid PDF")
          ? "Selected file is not a valid PDF document."
          : "Could not process this PDF file. Please try another file.";

      toast.error(message);
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
        setSelectedFileName(null);
      }
    }
  }, []);

  const handleChangePdf = useCallback(() => {
    const oldPdf = activePdfRef.current;
    activePdfRef.current = null;
    setUploadedFile(null);
    setProcessedPdf(null);
    if (oldPdf) {
      setTimeout(() => {
        oldPdf.destroy?.().catch(() => {});
      }, 0);
    }
  }, []);

  if (userLoaded && !user) {
    return null;
  }

  if (!uploadedFile || !processedPdf) {
    return (
      <PDFUpload
        onFileSelect={handleFileSelect}
        isProcessing={isProcessing}
        processingMessage={processingMessage}
        selectedFileName={selectedFileName}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {showNote && (
        <div className="border border-teal-200 bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 m-1 rounded-md px-3 py-2">
          <div className="flex items-center gap-2 w-full">
            <Info className="h-3 w-3 text-teal-600 shrink-0 dark:text-primary" />

            <p className="text-teal-900 dark:text-zinc-200 text-sm flex-1">
              <strong>Note: </strong>
              For Hindi text copied from <strong>Google Translate</strong>, we
              recommend using <strong>Unicode Hindi</strong> for best results.
            </p>

            <button
              className="h-4 w-4 p-0 text-teal-700 dark:text-zinc-300 hover:text-teal-800 dark:hover:text-white shrink-0 flex items-center justify-center cursor-pointer"
              onClick={() => setShowNote(false)}
              type="button"
              aria-label="Close note"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <PDFEditor
          key={`${uploadedFile.name}-${uploadedFile.size}-${uploadedFile.lastModified}`}
          templateId="custom-upload"
          userId={user?.id || userId}
          pdfFName={null}
          uploadedFile={uploadedFile}
          initialPdfDocument={processedPdf}
          defaultOverlays={EMPTY_OVERLAYS}
          defaultTemplateDesign={EMPTY_OVERLAYS}
          isAdmin={false}
          savedTemplateUUID={null}
          onChangePdf={handleChangePdf}
        />
      </div>
    </div>
  );
}

