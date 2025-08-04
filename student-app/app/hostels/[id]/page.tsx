"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaWifi, FaParking, FaUtensils, FaShieldAlt, FaTshirt } from 'react-icons/fa';

interface Hostel {
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
}

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  images: string[];
}

export default function HostelDetailPage() {
  const { id } = useParams();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHostel() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

        const res = await fetch(`http://localhost:1000/hostels/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch hostel`);

        const hostelData = await res.json();

        const roomRes = await fetch(`http://localhost:1000/hostels/${id}/room-types`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!roomRes.ok) throw new Error(`Failed to fetch room types`);

        const roomTypes = await roomRes.json();

        setHostel({ ...hostelData, roomTypes });
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to fetch hostel details.');
      }
    }

    if (id) fetchHostel();
  }, [id]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!hostel) return <div className="p-8 text-gray-500">Loading hostel details...</div>;
  
  // Helper function to format prices
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hostel Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{hostel.name}</h1>
        <p className="text-gray-600 mb-4">{hostel.address}</p>
        
        <Link href="/" className="text-blue-600 hover:underline flex items-center">
          ← Back to hostels
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {hostel.images.length > 0 ? (
          hostel.images.map((image, index) => (
            <div 
              key={index} 
              className={`${index === 0 ? 'md:col-span-4' : 'md:col-span-1'}`}
            >
              <div className="relative h-64 md:h-48 w-full rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`${hostel.name} image ${index + 1}`}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-4 bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">No images available</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description & Amenities */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{hostel.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hostel.amenities.wifi && (
                <div className="flex items-center">
                  <FaWifi className="text-blue-600 mr-2" />
                  <span>Wi-Fi</span>
                </div>
              )}
              {hostel.amenities.parking && (
                <div className="flex items-center">
                  <FaParking className="text-blue-600 mr-2" />
                  <span>Parking</span>
                </div>
              )}
              {hostel.amenities.cafeteria && (
                <div className="flex items-center">
                  <FaUtensils className="text-blue-600 mr-2" />
                  <span>Cafeteria</span>
                </div>
              )}
              {hostel.amenities.security && (
                <div className="flex items-center">
                  <FaShieldAlt className="text-blue-600 mr-2" />
                  <span>24/7 Security</span>
                </div>
              )}
              {hostel.amenities.laundry && (
                <div className="flex items-center">
                  <FaTshirt className="text-blue-600 mr-2" />
                  <span>Laundry</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Hostel Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-600">Contact</h3>
                <p className="mt-1">Admin: Hostel Administrator</p>
                <p>Phone: +233 24 123 4567</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-600">Location</h3>
                <p className="mt-1">{hostel.address}</p>
              </div>
              
              <div className="pt-4 border-t">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300">
                  Contact Hostel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Types Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Available Room Types</h2>
        
        {hostel.roomTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostel.roomTypes.map((roomType) => (
              <div 
                key={roomType.id} 
                className="border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full">
                  {roomType.images.length > 0 ? (
                    <img
                      src={roomType.images[0]}
                      alt={roomType.name}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="bg-gray-100 border-2 border-dashed w-full h-full flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold">{roomType.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {roomType.availableRooms} available
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {roomType.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(roomType.pricePerSemester)}
                      </p>
                      <p className="text-xs text-gray-500">per semester</p>
                    </div>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition duration-300">
                      View Details
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-700 mb-2">Room Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {roomType.amenities.slice(0, 4).map((amenity, idx) => (
                        <span 
                          key={idx}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {roomType.amenities.length > 4 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          +{roomType.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No room types available for this hostel</p>
          </div>
        )}
      </div>
    </div>
  );
}