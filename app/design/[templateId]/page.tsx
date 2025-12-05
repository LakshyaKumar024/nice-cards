// app/design/[templateId]/page.tsx
import { use } from "react";
import TemplateDetail from "@/components/templateDetail";
import type { Metadata } from "next";

export const generateStaticParams = async () => {
  return [];
};

type Props = {
  params: Promise<{ templateId: string }>;
};

type TemplateMetadata = {
  name: string;
  description: string;
  image: string;
  category?: string;
  tags?: string; // Comma-separated string of tags
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/design/${templateId}`, {
      method: "POST",
      body: "",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) throw new Error("Failed to fetch template");

    const result = await res.json();
    const template: TemplateMetadata = result.data;

    // Parse tags from JSON string to array
    const tagsArray = template.tags ? JSON.parse(template.tags) : [];

    // Parse images - handle both string URL and JSON array
    let imageUrl: string;
    try {
      const imagesArray = JSON.parse(template.image);
      imageUrl = Array.isArray(imagesArray) ? imagesArray[0] : template.image;
    } catch {
      // If parsing fails, it's already a plain string URL
      imageUrl = template.image;
    }

    // Enhanced SEO title with compelling format
    const seoTitle = `${template.name} - Premium Occasion Card`;

    // Rich, keyword-optimized description
    const seoDescription = `${
      template.description
    }. Purchase and customize this beautiful ${template.name.toLowerCase()} occasion card. Perfect for any celebration - personalize and download instantly with Nice Card.`;

    // Canonical URL for SEO
    const canonicalUrl = `${baseUrl}/cards/${templateId}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        template.name,
        "occasion cards",
        "greeting cards",
        "customizable cards",
        "Nice Cards",
        "Nice Card",
        "personalized cards",
        "celebration cards",
        "digital cards",
        ...tagsArray,
      ],
      authors: [{ name: "Nice Cards" }],
      creator: "Nice Cards",
      publisher: "Nice Cards",

      // Open Graph for social media
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        siteName: "Nice Cards",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${template.name} - Customizable Occasion Card by Nice Cards`,
            type: "image/jpeg",
          },
        ],
        locale: "en_US",
        type: "website",
      },

      // Twitter Card for better Twitter sharing
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [imageUrl],
        creator: "@nicecards",
        site: "@nicecards",
      },

      // Additional meta tags
      alternates: {
        canonical: canonicalUrl,
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Structured data for rich snippets
      other: {
        "og:image:secure_url": imageUrl,
        "article:published_time": new Date().toISOString(),
        "product:price:currency": "USD",
        "product:brand": "Nice Cards",
        "product:availability": "in stock",
      },
    };
  } catch (error) {
    console.log(error);

    // Fallback metadata for errors
    return {
      title: "Customizable Occasion Cards | Nice Cards",
      description:
        "Discover beautiful occasion cards at Nice Cards. Purchase, personalize, and download stunning greeting cards for every celebration.",
    };
  }
}

export default function Page({ params }: Props) {
  const { templateId } = use(params);

  return <TemplateDetail templateId={templateId} />;
}
