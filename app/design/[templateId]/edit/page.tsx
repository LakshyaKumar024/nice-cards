"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Template {
  uuid: string;
  name: string;
  description: string;
  price: number;
  catogery: string;
  paid: boolean;
  pdf: string;
  svg: string;
  image: string;
  preview_url: string | null;
  rating: number;
  downloads: number;
  createdAt: string;
  tags: string[];
}

export default function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateSvgs, setTemplateSvgs] = useState<string[]>([]);
  const { isLoaded, user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // const [cardData, setCardData] = useState({
  //   recipientName: "Guest Name",
  //   senderName: "Your Name",
  //   senderAddress: "123 Main Street, City, State 12345",
  //   eventDate: "2024-06-15",
  //   eventTime: "6:00 PM",
  //   eventLocation: "Grand Ballroom",
  //   customMessage: "We would be honored by your presence",
  // });

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);

      if (!isLoaded || !templateId) return;

      try {
        const res = await fetch(`/api/design/${templateId}`, {
          method: "POST",
          body: JSON.stringify({ userId: user?.id }),
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch template");

        const result = await res.json();
        const data = result.data;
        if (!data?.uuid) throw new Error("Invalid template data");
        setTemplate(data);
        console.log(data.svg);

        setTemplateSvgs(JSON.parse(data.svg));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading template");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && templateId) fetchTemplate();
  }, [templateId, isLoaded, user]);

  if (!loading) {
    console.log(templateSvgs);
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Loading template...
          </p>
        </div>
      </div>
    );

  // const handleInputChange = (field: keyof typeof cardData, value: string) => {
  //   setCardData((prev) => ({ ...prev, [field]: value }));
  // };

  // const handleSave = () => alert("Card design saved successfully!");
  // const handleDownload = () => alert("Preparing your card for download...");

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 sm:mb-6 text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Templates</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {template?.name}
            </h1>
            <p className="text-muted-foreground">
              Select a page to start editing
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templateSvgs.map((page, index) => (
              <Card
                key={index}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border bg-white">
                    <Image
                      src={`/api/getSvg/${page}` || "/placeholder.svg"}
                      width={100}
                      height={100}
                      alt={page}
                      className="h-full w-full object-contain scale-200"
                    />
                  </div>
                  <div>
                    {/* <CardTitle className="text-lg">{page.title}</CardTitle> */}
                    <CardDescription>Page {index + 1}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/design/${templateId}/edit/${index}`}>
                    <Button className="w-full">Edit Page</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
    // <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-[Geist]">
    //   {/* Header */}
    //   <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
    //     <div>
    //       <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
    //         Edit Invitation
    //       </h1>
    //       <p className="text-sm text-gray-500 dark:text-gray-400">
    //         Template ID: 001 • Customize your invitation card
    //       </p>
    //     </div>
    //   </header>

    //   {/* Main layout */}
    //   <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
    //     {/* Sidebar / Editor */}
    //     <section className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
    //       <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
    //         Edit Card Details
    //       </h2>

    //       <div className="flex flex-col gap-4">
    //         {Object.entries(cardData).map(([key, value]) => (
    //           <div key={key}>
    //             <label className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">
    //               {key.replace(/([A-Z])/g, " $1")}
    //             </label>
    //             {key === "customMessage" ? (
    //               <textarea
    //                 value={value}
    //                 onChange={(e) =>
    //                   handleInputChange(key as keyof typeof cardData, e.target.value)
    //                 }
    //                 rows={3}
    //                 className="w-full rounded-md bg-white dark:bg-neutral-950 border border-gray-300 dark:border-gray-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100 resize-none"
    //               />
    //             ) : (
    //               <input
    //                 type={key.includes("Date") ? "date" : "text"}
    //                 value={value}
    //                 onChange={(e) =>
    //                   handleInputChange(key as keyof typeof cardData, e.target.value)
    //                 }
    //                 className="w-full rounded-md bg-white dark:bg-neutral-950 border border-gray-300 dark:border-gray-700 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
    //               />
    //             )}
    //           </div>
    //         ))}

    //         {/* Buttons */}
    //         <div className="flex gap-3 pt-3">
    //           <button
    //             onClick={handleSave}
    //             className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 font-medium transition"
    //           >
    //             <Save size={16} />
    //             Save
    //           </button>
    //           <button
    //             onClick={handleDownload}
    //             className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md py-2 font-medium transition"
    //           >
    //             <Download size={16} />
    //             Download
    //           </button>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Live Preview */}
    //     <section className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
    //       <div className="w-full max-w-[600px] mx-auto">
    //         <SVGViewer svgContent={svgContent} title="Invitation Preview" />
    //       </div>

    //       <div className="w-full mt-6 bg-gray-100 dark:bg-neutral-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
    //         💡 <strong>Tip:</strong> Edits update instantly in the preview.
    //       </div>
    //     </section>
    //   </main>
    // </div>
  );
}
