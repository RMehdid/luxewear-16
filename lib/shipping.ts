import shippingData from '../data/shipping_points.json';

export type ShippingMethod = 'home' | 'collection_point';

export function getShippingPrice(wilaya: string, method: ShippingMethod, collectionPoint?: string): number {
    const wilayaData = shippingData.find(w => w.wilaya === wilaya);
    if (!wilayaData) return 800; // Default fallback

    if (method === 'collection_point' && collectionPoint) {
        const point = wilayaData.points.find(p => p.name === collectionPoint);
        if (point) return point.price;
    }

    return wilayaData.home_price || 800;
}

export function getWilayas(): string[] {
    return shippingData.map(w => w.wilaya);
}

export function getCollectionPoints(wilaya: string): { name: string; price: number }[] {
    const wilayaData = shippingData.find(w => w.wilaya === wilaya);
    return wilayaData ? wilayaData.points : [];
}

export function getHomeDeliveryPrice(wilaya: string): number {
    const wilayaData = shippingData.find(w => w.wilaya === wilaya);
    return wilayaData ? wilayaData.home_price : 800;
}
