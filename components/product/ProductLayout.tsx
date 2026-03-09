'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import OrderForm from '@/components/order/OrderForm';

interface Props {
    product: Product;
}

export default function ProductLayout({ product }: Props) {
    const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');

    const filteredImages = useMemo(() => {
        if (!selectedColor) return product.images;
        const lowerColor = selectedColor.toLowerCase();
        const specificImages = product.images.filter(img => img.toLowerCase().includes(lowerColor));
        return specificImages.length > 0 ? specificImages : product.images;
    }, [product.images, selectedColor]);
    return (
        <main className="min-h-screen bg-gray-50 block py-0 lg:py-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:gap-12 items-start">

                    {/* Left Column - Product Image */}
                    <div className="w-full lg:w-1/2 flex flex-col lg:gap-8 lg:sticky lg:top-12">
                        <ProductGallery images={filteredImages} />
                        <div className="hidden lg:block px-4 lg:px-0 mt-8">
                            <ProductInfo product={product} />
                        </div>
                    </div>

                    {/* Right Column - Details and Checkout */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6 px-4 lg:px-0 pb-12 mt-6 lg:mt-0">
                        <div className="block lg:hidden">
                            <ProductInfo product={product} />
                        </div>

                        <OrderForm product={product} selectedColor={selectedColor} onColorChange={setSelectedColor} />
                    </div>

                </div>
            </div>
        </main>
    );
}
