'use client';

import { useEffect, useState } from 'react';
import { FiMapPin, FiStar, FiPhone, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface NearbyPlace {
  name: string;
  address: string;
  rating?: number;
  reviews?: number;
  type?: string;
  thumbnail?: string;
  openNow?: boolean;
  phone?: string;
  website?: string;
}

interface PlaceCategory {
  category: string;
  places: NearbyPlace[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'Restaurants': '🍽️',
  'Supermarkets': '🛒',
  'Schools & Universities': '🎓',
  'Pharmacies': '💊',
  'Transport': '🚌',
  'Banks & ATMs': '🏧',
};

function PlaceCard({ place }: { place: NearbyPlace }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
      {place.thumbnail && (
        <img
          src={place.thumbnail}
          alt={place.name}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate">{place.name}</h4>
          {place.openNow !== undefined && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                place.openNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {place.openNow ? 'Open' : 'Closed'}
            </span>
          )}
        </div>

        {place.rating !== undefined && (
          <div className="flex items-center gap-1 mt-0.5">
            <FiStar className="text-yellow-400 fill-yellow-400 w-3 h-3" />
            <span className="text-xs font-medium text-gray-700">{place.rating.toFixed(1)}</span>
            {place.reviews && (
              <span className="text-xs text-gray-400">({place.reviews.toLocaleString()})</span>
            )}
          </div>
        )}

        {place.address && (
          <div className="flex items-start gap-1 mt-1">
            <FiMapPin className="text-gray-400 w-3 h-3 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 line-clamp-1">{place.address}</p>
          </div>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <FiPhone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <FiExternalLink className="w-3 h-3" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, places }: PlaceCategory) {
  const [expanded, setExpanded] = useState(false);
  const icon = CATEGORY_ICONS[category] ?? '📍';
  const visible = expanded ? places : places.slice(0, 3);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-800">
          {icon} {category}
          <span className="ml-2 text-xs font-normal text-gray-400">({places.length})</span>
        </span>
        {expanded ? (
          <FiChevronUp className="text-gray-400 w-4 h-4" />
        ) : (
          <FiChevronDown className="text-gray-400 w-4 h-4" />
        )}
      </button>

      <div className="p-3 space-y-2">
        {visible.map((place, i) => (
          <PlaceCard key={i} place={place} />
        ))}

        {places.length > 3 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full text-xs text-gray-500 hover:text-black font-medium py-1 transition-colors"
          >
            {expanded ? 'Show less' : `Show ${places.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  );
}

interface NearbyPlacesProps {
  hostelId: string;
}

export function NearbyPlaces({ hostelId }: NearbyPlacesProps) {
  const [data, setData] = useState<PlaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hostelId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
    const accessToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token')
        : null;

    fetch(`${apiUrl}/hostels/${hostelId}/nearby-places`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((json: PlaceCategory[]) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [hostelId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No nearby places data available for this location.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map(cat => (
        <CategorySection key={cat.category} category={cat.category} places={cat.places} />
      ))}
      <p className="text-[10px] text-gray-400 text-center pt-1">Powered by Google Maps via SerpAPI</p>
    </div>
  );
}
