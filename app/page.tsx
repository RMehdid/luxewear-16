import ProductLayout from '@/components/product/ProductLayout';
import { getProducts } from '@/lib/products';

export default async function Home() {
  const products = await getProducts();
  const product = products[0];

  if (!product) return <div>Product catalog empty. Please add rows to your Google Sheet!</div>;

  return <ProductLayout product={product} />;
}
