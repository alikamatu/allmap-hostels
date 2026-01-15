import { Star } from "lucide-react";
import React from "react";

function RatingDistribution({ distribution, loading }: { distribution: Record<number, number>; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">RATING DISTRIBUTION</h3>
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-16 h-3 bg-gray-200 mr-3"></div>
              <div className="flex-1 h-2 bg-gray-200 mr-3"></div>
              <div className="w-8 h-3 bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = Object.values(distribution || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">RATING DISTRIBUTION</h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution?.[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-16">
                <div className="flex">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-100 h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 w-8 text-right">{count}</span>
              <span className="text-xs text-gray-500 ml-1">({Math.round(percentage)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(RatingDistribution);