export interface Hostel {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  adminId: string;
  images: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
  };
  created_at: Date;
  updated_at: Date;
}