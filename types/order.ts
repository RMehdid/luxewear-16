export interface Order {
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    name: string;
    phone: string;
    wilaya: string;
    address: string;
    shipping_type: 'home' | 'collection_point';
    collection_point?: string;
    shipping_price: number;
    total_price: number;
    created_at: string;
}
