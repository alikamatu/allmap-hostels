export interface HostelCard {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string;
  address: string;
  location: string;
  coords: [number, number] | null;
  lowestPrice: number;
  highestPrice: number;
  base_price: number | null;
  distance: number | null;
  accepting_bookings: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  images: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
  };
  roomTypes: RoomType[];
  accepting_bookings: boolean;
  location: string;
  rating: number;
  reviews: number;
  contact?: {
    admin?: string;
    phone?: string;
    email?: string;
  };
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  amenities: string[];
  allowedGenders?: string[];
  availableRooms: number;
  totalRooms?: number;
}

export interface HostelFilters {
  sortBy: 'price' | 'availability';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}