'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import QuantitySelector from './QuantitySelector';
import ShippingSelector from './ShippingSelector';
import { getWilayas, getCollectionPoints, getHomeDeliveryPrice, ShippingMethod } from '@/lib/shipping';
import { submitOrder } from '@/lib/api-client';
import { OrderPayload } from '@/types/api';
import { formatPrice } from '@/utils/price';
import { PackageOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    product: Product;
    selectedColor: string;
    onColorChange: (color: string) => void;
}

export default function OrderForm({ product, selectedColor, onColorChange }: Props) {
    const [size, setSize] = useState(product.sizes[0] || '');
    const [quantity, setQuantity] = useState(1);

    const wilayas = useMemo(() => getWilayas(), []);
    const [wilaya, setWilaya] = useState('');
    const [shippingType, setShippingType] = useState<ShippingMethod>('home');
    const [collectionPoint, setCollectionPoint] = useState('');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const collectionPoints = useMemo(() => {
        return wilaya ? getCollectionPoints(wilaya) : [];
    }, [wilaya]);

    const homePrice = useMemo(() => {
        return wilaya ? getHomeDeliveryPrice(wilaya) : 800;
    }, [wilaya]);

    const shippingPrice = useMemo(() => {
        if (!wilaya) return 0;
        if (shippingType === 'home') return homePrice;
        if (shippingType === 'collection_point' && collectionPoint) {
            const point = collectionPoints.find(p => p.name === collectionPoint);
            return point ? point.price : 0;
        }
        return 0;
    }, [wilaya, shippingType, collectionPoint, homePrice, collectionPoints]);

    const totalPrice = product.price * quantity + shippingPrice;

    // Reset shipping options when wilaya changes
    const handleWilayaChange = (newWilaya: string) => {
        setWilaya(newWilaya);
        const newPoints = getCollectionPoints(newWilaya);
        if (newPoints.length === 0 && shippingType === 'collection_point') {
            setShippingType('home');
        }
        setCollectionPoint('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: OrderPayload = {
                product_id: product.id,
                quantity,
                size,
                color: selectedColor,
                name,
                phone,
                wilaya,
                address: shippingType === 'home' ? address : '',
                shipping_type: shippingType,
                collection_point: shippingType === 'collection_point' ? collectionPoint : undefined,
            };

            await submitOrder(payload);
            setSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to submit order");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 rounded-2xl border border-green-100">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h3>
                <p className="text-gray-600 mb-6 font-medium">
                    Merci {name.split(' ')[0]}, votre commande a été enregistrée avec succès. Notre équipe vous contactera pour la confirmation.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Commander un autre produit
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <PackageOpen className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Compléter votre commande</h2>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                {/* Product Options */}
                <div className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-900">Taille *</label>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSize(s)}
                                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-900">Couleur *</label>
                        <div className="flex gap-2">
                            {product.colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => onColorChange(c)}
                                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${selectedColor === c ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <QuantitySelector quantity={quantity} onChange={setQuantity} />
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Customer Details */}
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-900">Nom complet *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Ex. Amine Ben..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-900">Téléphone *</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="0550123456"
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>

                    <ShippingSelector
                        wilayas={wilayas}
                        selectedWilaya={wilaya}
                        onWilayaChange={handleWilayaChange}
                        shippingType={shippingType}
                        onShippingTypeChange={setShippingType}
                        collectionPoints={collectionPoints}
                        selectedPoint={collectionPoint}
                        onPointChange={setCollectionPoint}
                        homePrice={homePrice}
                    />

                    {shippingType === 'home' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-900">Adresse complète *</label>
                            <textarea
                                required={shippingType === 'home'}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Rue, Cité, Bâtiment..."
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Produit ({quantity}x)</span>
                        <span>{formatPrice(product.price * quantity)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                        <span>Livraison ({wilaya ? (shippingType === 'home' ? 'À domicile' : 'Point relais') : '-'})</span>
                        <span>{wilaya ? formatPrice(shippingPrice) : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>{wilaya ? formatPrice(totalPrice) : formatPrice(product.price * quantity)}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !wilaya || (shippingType === 'collection_point' && !collectionPoint)}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg tracking-wide hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                    {loading ? 'Traitement en cours...' : 'VALIDER LA COMMANDE'}
                </button>
            </form>
        </div>
    );
}
