'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface Props {
    images: string[];
}

export default function ProductGallery({ images }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollPosition = scrollRef.current.scrollLeft;
        const containerWidth = scrollRef.current.clientWidth;
        // Calculate the current index based on how far we've scrolled
        const newIndex = Math.round(scrollPosition / containerWidth);
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        setCurrentIndex(0);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
        }
    }, [images]);

    const scrollToImage = (index: number) => {
        if (!scrollRef.current) return;
        const containerWidth = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
            left: index * containerWidth,
            behavior: 'smooth',
        });
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square w-full sm:-mx-4 sm:w-[calc(100%+2rem)] lg:mx-0 lg:w-full overflow-hidden sm:rounded-none lg:rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                No image available
            </div>
        );
    }

    return (
        <div className="relative w-full group overflow-hidden lg:rounded-2xl">
            {/* Scrollable Image Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-[55vh] lg:h-auto lg:aspect-[4/5] bg-gray-100"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
                        <Image
                            src={img}
                            alt={`Product image ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pb-4">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToImage(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx
                                ? 'bg-white w-4'
                                : 'bg-white/80 hover:bg-black/50 border border-black/20'
                                }`}
                            aria-label={`Go to image ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
