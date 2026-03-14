import { Review } from '@/types/review';
import { Star } from 'lucide-react';

interface ReviewsProps {
    reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    // Calculate average rating
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    return (
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.round(averageRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                        {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {reviews.map((review, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-gray-900">{review.name}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-200'
                                            }`}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            "{review.text}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
