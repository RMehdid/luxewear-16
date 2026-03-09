export function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0,
    }).format(price).replace('DZD', 'DA');
}
