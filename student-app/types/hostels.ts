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
  distance: number | null; // Add distance property
}