'use client';

import { MapPin, Truck } from 'lucide-react';

interface Props {
    wilayas: string[];
    selectedWilaya: string;
    onWilayaChange: (w: string) => void;
    shippingType: 'home' | 'collection_point';
    onShippingTypeChange: (type: 'home' | 'collection_point') => void;
    collectionPoints: { name: string; price: number }[];
    selectedPoint: string;
    onPointChange: (p: string) => void;
    homePrice: number;
}

export default function ShippingSelector({
    wilayas,
    selectedWilaya,
    onWilayaChange,
    shippingType,
    onShippingTypeChange,
    collectionPoints,
    selectedPoint,
    onPointChange,
    homePrice
}: Props) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-900">Wilaya *</label>
                <select
                    value={selectedWilaya}
                    onChange={(e) => onWilayaChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="">Sélectionnez une wilaya</option>
                    {wilayas.map((w) => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>
            </div>

            {selectedWilaya && (
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-900">Mode de livraison *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onShippingTypeChange('home')}
                            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${shippingType === 'home'
                                    ? 'border-black bg-gray-50 ring-1 ring-black'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className={`p-2 rounded-full flex-shrink-0 ${shippingType === 'home' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">À domicile</div>
                                <div className="text-sm text-gray-500 mt-0.5">{homePrice === 0 ? "Calculé à l'étape suivante" : `${homePrice} DA`}</div>
                            </div>
                        </button>

                        {collectionPoints.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onShippingTypeChange('collection_point')}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${shippingType === 'collection_point'
                                        ? 'border-black bg-gray-50 ring-1 ring-black'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 ${shippingType === 'collection_point' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Point de relais</div>
                                    <div className="text-sm text-gray-500 mt-0.5">À partir de {Math.min(...collectionPoints.map(p => p.price))} DA</div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {selectedWilaya && shippingType === 'collection_point' && collectionPoints.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-900">Choisissez un point relais *</label>
                    <select
                        value={selectedPoint}
                        onChange={(e) => onPointChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="">Sélectionnez un point</option>
                        {collectionPoints.map((p) => (
                            <option key={p.name} value={p.name}>
                                {p.name} ({p.price} DA)
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
