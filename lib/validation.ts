import { OrderPayload } from '../types/api';

export function validatePhone(phone: string): boolean {
    // Simple Algerian phone validation: 05xx, 06xx, 07xx followed by 6 digits
    // Total 10 digits
    return /^(0)(5|6|7)[0-9]{8}$/.test(phone);
}

export function validateOrderData(data: Partial<OrderPayload>): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) errors.push("Name is required");
    if (!data.phone || !validatePhone(data.phone)) errors.push("Valid Algerian phone number is required (e.g. 0550123456)");
    if (!data.wilaya) errors.push("Wilaya is required");
    if (!data.address && data.shipping_type === 'home') errors.push("Address is required for home delivery");
    if (!data.quantity || data.quantity <= 0) errors.push("Quantity must be greater than 0");
    if (!data.size) errors.push("Size is required");
    if (!data.color) errors.push("Color is required");
    if (!data.product_id) errors.push("Product ID is required");
    if (!['home', 'collection_point'].includes(data.shipping_type as string)) errors.push("Invalid shipping type");

    return errors;
}
