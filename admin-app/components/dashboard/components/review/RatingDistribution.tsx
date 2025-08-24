import { Star } from "lucide-react";
import React from "react";

function RatingDistribution({ distribution, loading }: { distribution: Record<number, number>; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-20 h-4 bg-gray-200 rounded mr-4"></div>
              <div className="flex-1 h-3 bg-gray-200 rounded mr-4"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = Object.values(distribution || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution?.[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center group hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors duration-200">
              <div className="flex items-center w-20">
                <div className="flex">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out transform group-hover:scale-105 origin-left"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-12 text-right">{count}</span>
              <span className="text-sm text-gray-500 ml-2">({Math.round(percentage)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(RatingDistribution);