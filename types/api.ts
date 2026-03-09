export interface OrderPayload {
    product_id: string;
    quantity: number;
    size: string;
    color: string;
    name: string;
    phone: string;
    wilaya: string;
    address?: string; // Optional for collection points
    shipping_type: 'home' | 'collection_point';
    collection_point?: string;
    created_at?: string; // Generated on client or server
}
