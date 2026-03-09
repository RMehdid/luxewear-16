import { notFound } from 'next/navigation';
import ProductLayout from '@/components/product/ProductLayout';
import { getProducts } from '@/lib/products';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const products = await getProducts();
    const product = products.find(p => p.slug === slug);

    if (!product) {
        notFound();
    }

    return <ProductLayout product={product} />;
}
