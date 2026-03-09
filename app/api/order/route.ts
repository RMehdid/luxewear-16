import { NextResponse } from 'next/server';
import { validateOrderData } from '@/lib/validation';
import { saveOrder } from '@/lib/sheets';
import { getShippingPrice } from '@/lib/shipping';
import { getProducts } from '@/lib/products';
import { OrderPayload } from '@/types/api';
import { Order } from '@/types/order';

export async function POST(req: Request) {
    try {
        let body: OrderPayload;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
        }

        const errors = validateOrderData(body);
        if (errors.length > 0) {
            return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
        }

        const products = await getProducts();
        const product = products.find(p => p.id === body.product_id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Invalid product' }, { status: 400 });
        }

        // Verify constraints server-side to prevent tampering
        const verifiedShippingPrice = getShippingPrice(body.wilaya, body.shipping_type, body.collection_point);
        const verifiedTotalPrice = (product.price * body.quantity) + verifiedShippingPrice;

        const finalOrder: Order = {
            product_id: body.product_id,
            quantity: body.quantity,
            size: body.size,
            color: body.color,
            name: body.name,
            phone: body.phone,
            wilaya: body.wilaya,
            address: body.address || '',
            shipping_type: body.shipping_type,
            collection_point: body.collection_point,
            shipping_price: verifiedShippingPrice,
            total_price: verifiedTotalPrice,
            created_at: body.created_at || new Date().toISOString(),
        };

        const result = await saveOrder(finalOrder);

        if (!result.success) {
            // In a production app, we might log this internally but return a generic error to the user
            console.error("Failed to save to sheets:", result.error);
            return NextResponse.json({ success: false, message: 'Failed to process order internally' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order submitted successfully',
            isMocked: result.mocked // Dev-friendly hint
        });

    } catch (error: unknown) {
        console.error("Order completion error:", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
