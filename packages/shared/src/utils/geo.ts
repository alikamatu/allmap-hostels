// Haversine formula for distance calculation
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Parse location from various formats
export function parseLocation(location: any): [number, number] | null {
  if (!location) return null;
  
  // Handle WKB format (PostGIS) — browser-safe (no Node.js Buffer)
  if (typeof location === 'string' && location.startsWith('0101000020E6100000')) {
    try {
      const hex = location.substring(18);
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      const view = new DataView(bytes.buffer);
      const lng = view.getFloat64(0, true);
      const lat = view.getFloat64(8, true);
      return [lng, lat];
    } catch (error) {
      console.error('Failed to parse WKB location:', error);
      return null;
    }
  }
  
  // Handle GeoJSON format
  if (typeof location === 'object' && location.coordinates) {
    return [location.coordinates[0], location.coordinates[1]];
  }
  
  // Handle string format
  if (typeof location === 'string') {
    const match = location.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
    return match ? [parseFloat(match[1]), parseFloat(match[2])] : null;
  }

  return null;
}