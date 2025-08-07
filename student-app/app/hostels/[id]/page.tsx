"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaWifi, FaParking, FaUtensils, FaShieldAlt, FaTshirt, FaBed, FaStar, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  rating: number;
  reviews: number;
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
}

export default function HostelDetailPage() {
  const { id } = useParams();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1000";

  useEffect(() => {
    async function fetchHostel() {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

        const res = await fetch(`${apiUrl}/hostels/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch hostel`);

        const hostelData = await res.json();

        const roomRes = await fetch(`${apiUrl}/hostels/${id}/room-types`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!roomRes.ok) throw new Error(`Failed to fetch room types`);

        const roomTypes = await roomRes.json();

        // Simulate rating and reviews for demo
        const rating = Math.round((Math.random() * 3 + 2) * 10) / 10;
        const reviews = Math.floor(Math.random() * 100) + 10;
        
        setHostel({ ...hostelData, roomTypes, rating, reviews });
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to fetch hostel details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchHostel();
  }, [id, apiUrl]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!hostel) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + hostel.images.length) % hostel.images.length);
    }
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Hostel</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          ← Back to hostels
        </Link>
      </div>
    </div>
  );

  if (loading || !hostel) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Gallery Modal */}
      {galleryOpen && hostel.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            onClick={closeGallery}
            className="absolute top-6 right-6  hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-3xl" />
          </button>
          
          <button 
            onClick={() => navigateImage('prev')}
            className="absolute left-6  hover:text-gray-300 transition-colors z-10"
          >
            <FaChevronLeft className="text-3xl" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={hostel.images[currentImageIndex]}
              alt={`${hostel.name} gallery image`}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
          </div>
          
          <button 
            onClick={() => navigateImage('next')}
            className="absolute right-6  hover:text-gray-300 transition-colors z-10"
          >
            <FaChevronRight className="text-3xl" />
          </button>
          
          <div className="absolute bottom-6  text-lg">
            {currentImageIndex + 1} / {hostel.images.length}
          </div>
        </div>
      )}

      {/* Hostel Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4">
              ← Back to hostels
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{hostel.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(hostel.rating) ? "fill-current" : "fill-current opacity-30"} />
                ))}
              </div>
              <span className="ml-2 text-gray-600">{hostel.rating} ({hostel.reviews} reviews)</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <div className="text-xl font-bold text-blue-700">{formatPrice(hostel.roomTypes[0]?.pricePerMonth || 0)}</div>
            <div className="text-sm text-gray-600">Starting price per month</div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <FaBed className="mr-1 text-blue-500" /> {hostel.address}
          </span>
        </div>
      </div>

      {/* img Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12">
        {hostel.images.length > 0 ? (
          hostel.images.map((image, index) => (
            <motion.div 
              key={index} 
              className={`relative cursor-pointer overflow-hidden rounded-xl group
                ${index === 0 ? 'md:col-span-4 h-80' : 'md:col-span-1 h-40'}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => openGallery(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <img
                src={image}
                alt={`${hostel.name} image ${index + 1}`}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <span className=" opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="md:col-span-4 bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
            <span className="text-gray-500">No images available</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Left Column - Description & Amenities */}
        <div className="lg:col-span-2">
          {/* Description */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {hostel.description}
            </p>
          </motion.div>

          {/* Amenities */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {hostel.amenities.wifi && (
                <div className="flex items-center  p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaWifi className="text-blue-600 text-xl" />
                  </div>
                  <span>Wi-Fi</span>
                </div>
              )}
              {hostel.amenities.parking && (
                <div className="flex items-center  p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaParking className="text-blue-600 text-xl" />
                  </div>
                  <span>Parking</span>
                </div>
              )}
              {hostel.amenities.cafeteria && (
                <div className="flex items-center  p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaUtensils className="text-blue-600 text-xl" />
                  </div>
                  <span>Cafeteria</span>
                </div>
              )}
              {hostel.amenities.security && (
                <div className="flex items-center  p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaShieldAlt className="text-blue-600 text-xl" />
                  </div>
                  <span>24/7 Security</span>
                </div>
              )}
              {hostel.amenities.laundry && (
                <div className="flex items-center  p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FaTshirt className="text-blue-600 text-xl" />
                  </div>
                  <span>Laundry</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Contact & Quick Info */}
        <div className="lg:col-span-1">
          <motion.div 
            className=" rounded-xl shadow-lg p-6 sticky top-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Hostel Information</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-600 mb-1">Contact</h3>
                <p className="mt-1">Admin: Hostel Administrator</p>
                <p>Phone: +233 24 123 4567</p>
                <p>Email: contact@{hostel.name.toLowerCase().replace(/\s/g, '')}.com</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-600 mb-1">Location</h3>
                <p className="mt-1">{hostel.address}</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View on map
                </button>
              </div>
              
              <div className="pt-4 border-t">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800  py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Contact Hostel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Room Types Section */}
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">Available Room Types</h2>
        
        {hostel.roomTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostel.roomTypes.map((roomType) => (
              <motion.div 
                key={roomType.id} 
                className="border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 "
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{roomType.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      roomType.availableRooms > 3 ? 'bg-green-100 text-green-800' : 
                      roomType.availableRooms > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {roomType.availableRooms > 0 
                        ? `${roomType.availableRooms} available` 
                        : 'Fully booked'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {roomType.description || 'Comfortable living space with essential amenities'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(roomType.pricePerSemester)}
                      </p>
                      <p className="text-xs text-gray-500">per semester</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-700 font-medium">
                        {formatPrice(roomType.pricePerMonth)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>Capacity</span>
                      <span className="font-medium">{roomType.capacity} person(s)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(roomType.capacity / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-3">Room Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {roomType.amenities.slice(0, 5).map((amenity, idx) => (
                        <span 
                          key={idx}
                          className=" text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-100"
                        >
                          {amenity}
                        </span>
                      ))}
                      {roomType.amenities.length > 5 && (
                        <span className=" text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-100">
                          +{roomType.amenities.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="mt-6 w-full  border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium transition-all duration-300">
                    View Room Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12  rounded-xl border border-gray-100">
            <FaBed className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No room types available for this hostel</p>
            <p className="text-gray-400 mt-2">Check back later for availability updates</p>
          </div>
        )}
      </motion.div>
      
      {/* Call to Action */}
      <motion.div 
        className="mt-16 mb-8 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold  mb-4">Ready to book your stay?</h2>
        <p className="text-blue-100 max-w-2xl mx-auto mb-6">
          Secure your spot in {hostel.name} today and experience comfortable student living
        </p>
        <button className=" text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          Book Now
        </button>
      </motion.div>
    </div>
  );
}