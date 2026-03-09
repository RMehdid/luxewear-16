import { OrderPayload } from '@/types/api';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    isMocked?: boolean;
}

export async function submitOrder(payload: OrderPayload): Promise<ApiResponse> {
    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Une erreur est survenue lors de la commande.');
        }

        return data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Erreur de connexion au serveur.');
    }
}
