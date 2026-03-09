import { google } from 'googleapis';
import { Order } from '../types/order';

interface SaveOrderResult {
    success: boolean;
    mocked?: boolean;
    data?: any;
    error?: string;
}

export async function saveOrder(order: Order): Promise<SaveOrderResult> {
    try {
        if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.SHEET_ID) {
            console.warn("Missing Google Sheets environment variables. Mocking row serialization.");
            console.log("Mock saved order:", order);
            return { success: true, mocked: true };
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                // Handle escaped newline characters in private key string
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.SHEET_ID;

        // Columns:
        // Date | Order ID | Product | Variant | Quantity | Name | Phone | Wilaya | Address/Relais | Shipping Route | Subtotal | Shipping Fee | Total Price
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:M',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        order.created_at,
                        Math.floor(Math.random() * 1000000000).toString(), // Basic ID generation, usually done backend
                        order.product_id,
                        `${order.color} - ${order.size}`,
                        order.quantity,
                        order.name,
                        order.phone,
                        order.wilaya,
                        order.address || order.collection_point || '',
                        order.shipping_type,
                        (order.total_price - order.shipping_price), // Subtotal
                        order.shipping_price,
                        order.total_price,
                    ],
                ],
            },
        });

        return { success: true, data: response.data };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error saving to Google Sheets:', error.message);
            return { success: false, error: error.message };
        }
        console.error('Unknown error saving to Google Sheets:', error);
        return { success: false, error: 'Unknown sheets serialization failure' };
    }
}
