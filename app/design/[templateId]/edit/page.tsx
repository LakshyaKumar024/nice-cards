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
  );
}
