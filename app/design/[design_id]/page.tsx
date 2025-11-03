"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Check, Download } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Template } from "@/lib/types";


// Dummy template data
const dummyTemplates: Template[] = [
  {
    id: "1",
    name: "Elegant Wedding Invitation",
    description: "A sophisticated wedding invitation template with gold foil accents and elegant typography. Perfect for formal weddings and special ceremonies. Features a beautiful floral design that can be customized to match your wedding colors.",
    price: 29.99,
    category: "Wedding",
    image_url: "/images/wedding-elegant.jpg",
    preview_url: "/images/wedding-elegant-preview.jpg",
    editable_fields: [
      { label: "Bride & Groom Names", type: "text", required: true },
      { label: "Wedding Date", type: "date", required: true },
      { label: "Venue Name", type: "text", required: true },
      { label: "Ceremony Time", type: "time", required: true },
      { label: "RSVP Date", type: "date", required: true },
      { label: "Custom Message", type: "textarea", required: false }
    ],
    features: [
      "High-quality 300 DPI resolution",
      "Print-ready PDF format",
      "Digital sharing options",
      "Fully customizable text",
      "Multiple color variations",
      "Lifetime updates"
    ],
    rating: 4.8,
    downloads: 1247,
    created_at: "2024-01-15",
    tags: ["elegant", "formal", "luxury", "floral"]
  },
  {
    id: "2",
    name: "Modern Birthday Party",
    description: "Clean and contemporary birthday invitation with bold geometric patterns and vibrant colors. Great for milestone birthdays and modern celebrations. Easy to customize with your party details.",
    price: 19.99,
    category: "Birthday",
    image_url: "/images/birthday-modern.jpg",
    preview_url: "/images/birthday-modern-preview.jpg",
    editable_fields: [
      { label: "Birthday Person Name", type: "text", required: true },
      { label: "Age", type: "number", required: false },
      { label: "Party Date", type: "date", required: true },
      { label: "Party Location", type: "text", required: true },
      { label: "Theme", type: "text", required: false },
      { label: "Dress Code", type: "text", required: false }
    ],
    features: [
      "Modern geometric design",
      "Social media optimized",
      "Quick customization",
      "Multiple layout options",
      "Digital delivery",
      "Mobile-friendly preview"
    ],
    rating: 4.6,
    downloads: 892,
    created_at: "2024-02-20",
    tags: ["modern", "geometric", "colorful", "celebration"]
  },
  {
    id: "3",
    name: "Corporate Event Template",
    description: "Professional business event invitation perfect for conferences, seminars, and corporate gatherings. Features a clean layout with corporate branding options and professional typography.",
    price: 24.99,
    category: "Business",
    image_url: "/images/corporate-event.jpg",
    preview_url: "/images/corporate-event-preview.jpg",
    editable_fields: [
      { label: "Event Name", type: "text", required: true },
      { label: "Company Name", type: "text", required: true },
      { label: "Event Date & Time", type: "datetime", required: true },
      { label: "Venue Address", type: "text", required: true },
      { label: "Agenda", type: "textarea", required: false },
      { label: "Speaker Names", type: "text", required: false }
    ],
    features: [
      "Professional layout",
      "Brand customization",
      "QR code integration",
      "Multiple file formats",
      "Bulk editing support",
      "Email template included"
    ],
    rating: 4.7,
    downloads: 567,
    created_at: "2024-01-10",
    tags: ["professional", "business", "corporate", "formal"]
  },
  {
    id: "4",
    name: "Beach Wedding Celebration",
    description: "Tropical themed wedding invitation with ocean colors and beach elements. Perfect for destination weddings and summer ceremonies. Features a relaxed yet elegant design.",
    price: 27.99,
    category: "Wedding",
    image_url: "/images/beach-wedding.jpg",
    preview_url: "/images/beach-wedding-preview.jpg",
    editable_fields: [
      { label: "Couple Names", type: "text", required: true },
      { label: "Wedding Date", type: "date", required: true },
      { label: "Beach Location", type: "text", required: true },
      { label: "Sunset Time", type: "time", required: false },
      { label: "Attire Suggestion", type: "text", required: false },
      { label: "Beach Theme Details", type: "textarea", required: false }
    ],
    features: [
      "Tropical design elements",
      "Beach color palette",
      "Destination wedding ready",
      "Bilingual support",
      "Travel information section",
      "Weather-appropriate design"
    ],
    rating: 4.9,
    downloads: 734,
    created_at: "2024-03-05",
    tags: ["beach", "tropical", "destination", "summer"]
  }
];

const TemplateDetail = ({ templateId }: { templateId?: string }) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate API call to fetch template data
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const id = templateId || new URLSearchParams(window.location.search).get('id') || '2';
        const foundTemplate = dummyTemplates.find(t => t.id === id) || dummyTemplates[0];
        setTemplate(foundTemplate);
        
        // Check if template is already purchased (simulate localStorage check)
        const purchasedTemplates = JSON.parse(localStorage.getItem('purchasedTemplates') || '[]');
        setIsPurchased(purchasedTemplates.includes(foundTemplate.id));
      } catch (error) {
        console.error('Error fetching template:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handlePurchase = async () => {
    if (!template) return;
    
    setPurchasing(true);
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to purchased templates in localStorage
      const purchasedTemplates = JSON.parse(localStorage.getItem('purchasedTemplates') || '[]');
      purchasedTemplates.push(template.id);
      localStorage.setItem('purchasedTemplates', JSON.stringify(purchasedTemplates));
      
      setIsPurchased(true);
      
      // Show success message
      alert(`Successfully purchased "${template.name}"!`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (!template) return;
    // Simulate download process
    alert(`Downloading "${template.name}"...`);
    // In a real app, this would trigger the actual download
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-xl text-muted-foreground">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">Template not found</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Templates</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Template Preview */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden shadow-elegant bg-card border">
              <div className="aspect-3/4 w-full relative">
                <Image
                  src={template.preview_url || template.image_url}
                  alt={template.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            {template.preview_url && (
              <div className="text-sm text-muted-foreground text-center">
                Full template preview - All elements are customizable
              </div>
            )}

            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">{template.rating}</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">{template.downloads}</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-2xl font-bold text-primary">
                  {new Date(template.created_at).getFullYear()}
                </div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Template Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {template.name}
                  </h1>
                  <Badge className="bg-accent text-accent-foreground text-sm">
                    {template.category}
                  </Badge>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    ${template.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Customizable Fields */}
            <div className="border rounded-lg p-4 sm:p-6 bg-card">
              <h3 className="font-semibold text-lg mb-3">Customizable Fields:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {template.editable_fields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${field.required ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <span className="font-medium">{field.label}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {field.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="border rounded-lg p-4 sm:p-6 bg-card">
              <h3 className="font-semibold text-lg mb-3">Template Features:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPurchased ? (
                <>
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Edit Template
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push('/my-templates')}
                  >
                    View My Templates
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  size="lg"
                  className="w-full"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Purchase Template - ${template.price.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  ✓ 30-day money-back guarantee
                </p>
                <p className="text-sm text-muted-foreground">
                  ✓ Lifetime updates included
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateDetail;