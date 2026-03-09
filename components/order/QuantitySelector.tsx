'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
    quantity: number;
    onChange: (q: number) => void;
}

export default function QuantitySelector({ quantity, onChange }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">Quantité</label>
            <div className="flex items-center w-fit rounded-lg border border-gray-300 bg-white">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                    aria-label="Decrease quantity"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                <button
                    type="button"
                    onClick={() => onChange(quantity + 1)}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                    aria-label="Increase quantity"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
