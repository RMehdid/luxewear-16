import { Product } from '@/types/product';
import { formatPrice } from '@/utils/price';

interface Props {
    product: Product;
}

export default function ProductInfo({ product }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                    <>
                        <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.oldPrice)}
                        </span>
                        <span className="bg-red-100 text-red-700 text-sm font-semibold px-2.5 py-0.5 rounded">
                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </span>
                    </>
                )}
            </div>
            <div className="mt-4 prose prose-sm text-gray-500">
                <p>{product.description}</p>
                {product.features && product.features.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        {product.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
