import { Award, MessageCircle, Star, TrendingUp, Users } from "lucide-react";
import React from "react";

function StatsCards({ stats, loading }: { loading: boolean, stats: any }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse hover:shadow-md transition-shadow duration-200">
            <div className="h-4 bg-gray-200 rounded mb-3 w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const rating = stats.averageRating || 0;
  const fullStars = Math.floor(rating);
  const fractional = rating - fullStars;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-full">
            <MessageCircle className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</p>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative">
                  <Star className="h-5 w-5 text-gray-200" />
                  <Star
                    className="h-5 w-5 text-yellow-400 absolute top-0 left-0"
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
          <div className="p-2 bg-yellow-50 rounded-full">
            <Award className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Helpful Votes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalHelpfulVotes}</p>
          </div>
          <div className="p-2 bg-green-50 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">5-Star Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{stats.ratingDistribution?.[5] || 0}</p>
            {stats.totalReviews > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {Math.round((stats.ratingDistribution?.[5] || 0) / stats.totalReviews * 100)}% of total
              </p>
            )}
          </div>
          <div className="p-2 bg-purple-50 rounded-full">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(StatsCards);