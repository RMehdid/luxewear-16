export interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    oldPrice?: number;
    reviews?: import('./review').Review[];
    description: string;
    features: string[];
    sizes: string[];
    colors: string[];
    images: string[];
}
