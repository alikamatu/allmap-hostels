'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HostelCard {
  id: string;
  name: string;
  imageUrl: string | null;
}

export default function HomePage() {
  const [hostels, setHostels] = useState<HostelCard[]>([]);
  
  useEffect(() => {
    async function fetchHostels() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch('http://localhost:1000/hostels/fetch', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch hostels: ${res.statusText}`);
        }

        const data = await res.json();
        const formatted = data.map((hostel: any) => ({
          id: hostel.id,
          name: hostel.name,
          imageUrl: hostel.images?.[0] || null,
        }));

        setHostels(formatted);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    }

    fetchHostels();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Featured Hostels</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {hostels.length > 0 ? (
          hostels.map((hostel) => (
            <Link 
              key={hostel.id} 
              href={`/hostels/${hostel.id}`}
              className="block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square">
                {hostel.imageUrl ? (
                  <img 
                    src={hostel.imageUrl} 
                    alt={hostel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate">{hostel.name}</h2>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No hostels found</p>
          </div>
        )}
      </div>
    </div>
  );
}
