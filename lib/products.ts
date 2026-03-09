import { google } from 'googleapis';
import { Product } from '@/types/product';
import localProducts from '@/data/products.json';

/**
 * Helper to safely split comma-separated strings into trimmed arrays.
 * e.g. "S, M, L" -> ["S", "M", "L"]
 */
const parseArray = (str: string | undefined): string[] => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Parses image arrays and converts Google Drive share links into direct export links
 */
const parseImages = (str: string | undefined): string[] => {
    if (!str) return [];
    return str.split(',').map(item => {
        let url = item.trim();
        // Match standard drive share links like https://drive.google.com/file/d/THIS_IS_THE_ID/view
        const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
    }).filter(Boolean);
};

export async function getProducts(): Promise<Product[]> {
    try {
        if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.SHEET_ID) {
            console.warn("Missing Google Sheets environment variables. Falling back to local products.json.");
            return localProducts as Product[];
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                // Handle escaped newline characters in private key string
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.SHEET_ID;

        // Fetch data from the "Products" tab
        // Expected Columns: ID | Slug | Name | Description | Features | Price | Sizes | Colors | Image URLs
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Products!A2:I', // Start at A2 to skip headers
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.log("No product data found in Google Sheets.");
            return [];
        }

        const products: Product[] = rows.map((row) => {
            // Guarantee we don't crash if a column is left blank
            const [
                id = '',
                slug = '',
                name = '',
                description = '',
                featuresStr = '',
                priceStr = '0',
                sizesStr = '',
                colorsStr = '',
                imagesStr = ''
            ] = row;

            return {
                id,
                slug,
                name,
                description,
                features: parseArray(featuresStr),
                price: parseInt(priceStr, 10) || 0,
                sizes: parseArray(sizesStr),
                colors: parseArray(colorsStr),
                images: parseImages(imagesStr),
            };
        });

        return products.filter(p => p.id && p.slug); // Only return valid products

    } catch (error) {
        console.error("Failed to fetch products from Google Sheets:", error);
        // Fallback to local JSON if Google Sheets API fails
        return localProducts as Product[];
    }
}
