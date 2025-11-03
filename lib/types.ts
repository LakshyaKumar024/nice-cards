export interface Template {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    preview_url: string | null;
    editable_fields: Array<{
        label: string;
        type: string;
        required: boolean;
    }>;
    features: string[];
    rating: number;
    downloads: number;
    created_at: string;
    tags: string[];
}