import { Award, MessageCircle, Star, TrendingUp, Users } from "lucide-react";
import React from "react";
import { StatsCardsProps } from "@/types/review";

function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border-t-4 border-t-[#FF6A00] p-3 animate-pulse">
            <div className="h-3 bg-gray-200 mb-2 w-20"></div>
            <div className="h-6 bg-gray-200 w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  const rating = stats.averageRating || 0;
  const fullStars = Math.floor(rating);
  const fractional = rating - fullStars;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
      {/* Total Reviews */}
      <div className="bg-white border-t-4 border-t-blue-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Total Reviews</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
          <div className="p-2 bg-blue-50">
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Average Rating */}
      <div className="bg-white border-t-4 border-t-yellow-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Average Rating</p>
            <p className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</p>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative">
                  <Star className="h-3 w-3 text-gray-200" />
                  <Star
                    className="h-3 w-3 text-yellow-400 absolute top-0 left-0"
                    style={{
                      clipPath: i < fullStars 
                        ? 'none' 
                        : i === fullStars && fractional > 0 
                          ? `inset(0 ${100 - (fractional * 100)}% 0 0)` 
                          : 'inset(0 100% 0 0)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-2 bg-yellow-50">
            <Award className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* Helpful Votes */}
      <div className="bg-white border-t-4 border-t-green-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Helpful Votes</p>
            <p className="text-lg font-bold text-gray-900">{stats.totalHelpfulVotes}</p>
          </div>
          <div className="p-2 bg-green-50">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* 5-Star Reviews */}
      <div className="bg-white border-t-4 border-t-purple-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">5-Star Reviews</p>
            <p className="text-lg font-bold text-gray-900">{stats.ratingDistribution?.[5] || 0}</p>
            {stats.totalReviews > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((stats.ratingDistribution?.[5] || 0) / stats.totalReviews * 100)}% of total
              </p>
            )}
          </div>
          <div className="p-2 bg-purple-50">
            <Users className="h-4 w-4 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StatsCards);