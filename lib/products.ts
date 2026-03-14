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
        const driveRegex = /drive\.google\.com\/file\/d\/([^\/\?]+)/;
        // Also match open?id= format
        const openRegex = /drive\.google\.com\/open\?id=([^&]+)/;
        const match = url.match(driveRegex) || url.match(openRegex);
        if (match && match[1]) {
            // Use thumbnail endpoint - more reliable than uc?export=view
            url = `https://drive.google.com/thumbnail?id=${match[1]}&sz=s1600`;
        }
        return url;
    }).filter(Boolean);
};

/**
 * Parses a string of reviews separated by `/`.
 * Expected format: "Name - Review text - 5 stars / Name 2 - Review 2 - 4 stars"
 */
const parseReviews = (str: string | undefined): import('@/types/review').Review[] => {
    if (!str) return [];

    return str.split('/')
        .map(reviewStr => reviewStr.trim())
        .filter(Boolean)
        .map(reviewStr => {
            // Split by '-' but we need to be careful if the review text itself contains dashes
            // We'll split by ' - ' assuming that's the separator used, or just parse from ends.
            // Format: Name - Review - int stars
            const parts = reviewStr.split(' - ');

            if (parts.length >= 3) {
                const name = parts[0].trim();
                // Extract stars (last part)
                const starsPart = parts[parts.length - 1].trim();
                const rating = parseInt(starsPart, 10) || 5; // Default to 5 if parse fails

                // The review text is everything in between
                const text = parts.slice(1, parts.length - 1).join(' - ').trim();

                return { name, text, rating };
            }

            // Fallback for poorly formatted reviews
            const fallbackParts = reviewStr.split('-');
            if (fallbackParts.length >= 2) {
                return {
                    name: fallbackParts[0].trim(),
                    text: fallbackParts.slice(1).join('-').trim(),
                    rating: 5
                }
            }

            return {
                name: "Customer",
                text: reviewStr,
                rating: 5
            };
        });
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
        // Expected Columns: ID | Slug | Name | Description | Features | Old Price | Sizes | Colors | New Price | Reviews | Image URLs
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Products!A2:K', // Start at A2 to skip headers
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
                oldPriceStr = '',
                sizesStr = '',
                colorsStr = '',
                newPriceStr = '0',
                reviewsStr = '',
                imagesStr = ''
            ] = row;

            return {
                id,
                slug,
                name,
                description,
                features: parseArray(featuresStr),
                price: parseInt(newPriceStr, 10) || 0,
                oldPrice: parseInt(oldPriceStr, 10) || undefined,
                reviews: parseReviews(reviewsStr),
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
