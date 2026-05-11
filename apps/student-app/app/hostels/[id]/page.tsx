import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi';
import { BrandLogo } from '@/_components/brand';
import {
  generateBreadcrumbSchema,
  generateHostelSchema,
} from '@/lib/seo';
import {
  generateSchemaScript,
  optimizeMetaDescription,
} from '@/lib/seo-components';

interface PublicHostelPageProps {
  params: Promise<{ id: string }>;
}

interface PublicHostel {
  id: string;
  name: string;
  description: string;
  address?: string;
  city?: string;
  base_price?: number;
  images?: string[];
  amenities?: string[] | Record<string, boolean>;
  rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
  location?: string;
  phone?: string;
  email?: string;
  updated_at?: string;
}

function parseLngLat(loc?: string): { lat: number; lng: number } | null {
  if (!loc) return null;
  const m = loc.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

async function getHostel(id: string): Promise<PublicHostel | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
  try {
    const res = await fetch(`${apiUrl}/public/hostels/${id}`, {
      next: { revalidate: 0 }
    });
    if (!res.ok) return null;
    return res.json() as Promise<PublicHostel>;
  } catch (error) {
    console.error('Error fetching hostel:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PublicHostelPageProps): Promise<Metadata> {
  const { id } = await params;
  const hostel = await getHostel(id);
  if (!hostel) return { title: 'Hostel Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
  const url = `${siteUrl}/hostels/${id}`;

  const cityHint = hostel.city || hostel.address?.split(',').pop()?.trim() || 'Ghana';
  const priceHint = hostel.base_price
    ? ` From GHC ${hostel.base_price} per semester.`
    : '';
  const description = optimizeMetaDescription(
    `${hostel.name} — verified student hostel in ${cityHint}.${priceHint} ` +
      (hostel.description || 'Book on AllMap Hostels with secure payments and verified reviews.'),
    180,
  );

  const title = `${hostel.name} — Student Hostel in ${cityHint}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'AllMap Hostels',
      locale: 'en_GH',
      images: hostel.images?.length
        ? hostel.images.slice(0, 4).map((src) => ({ url: src, alt: hostel.name }))
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: hostel.images?.[0] ? [hostel.images[0]] : [],
    },
    keywords: [
      hostel.name,
      `${hostel.name} hostel`,
      `${hostel.name} prices`,
      `hostels in ${cityHint}`,
      `student hostel ${cityHint}`,
      `book ${hostel.name}`,
      'AllMap Hostels',
    ],
  };
}

export default async function PublicHostelPage({ params }: PublicHostelPageProps) {
  const { id } = await params;
  const hostel = await getHostel(id);
  if (!hostel) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
  const url = `${siteUrl}/hostels/${id}`;
  const coords = parseLngLat(hostel.location);
  const amenityNames = Array.isArray(hostel.amenities)
    ? hostel.amenities
    : hostel.amenities && typeof hostel.amenities === 'object'
      ? Object.entries(hostel.amenities)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];

  const hostelSchema = generateHostelSchema({
    name: hostel.name,
    description: hostel.description,
    address: hostel.address ?? '',
    city: hostel.city,
    country: 'GH',
    latitude: coords?.lat,
    longitude: coords?.lng,
    phone: hostel.phone,
    email: hostel.email,
    image: hostel.images?.length ? hostel.images : undefined,
    url,
    basePrice: hostel.base_price,
    priceRange: hostel.base_price ? `GHC ${hostel.base_price}` : undefined,
    amenities: amenityNames,
    rating: hostel.rating ? Number(hostel.rating) : undefined,
    reviewCount: hostel.total_reviews,
    identifier: hostel.id,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Hostels', url: `${siteUrl}/dashboard` },
    { name: hostel.name, url },
  ]);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {generateSchemaScript(hostelSchema, 'hostel-jsonld')}
      {generateSchemaScript(breadcrumbSchema, 'hostel-breadcrumb')}
      
      {/* Search-Optimized Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size={32} />
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-bold hover:text-gray-600 transition-colors">Sign In</Link>
            <Link href="/login?tab=signup" className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-all">Join AllMap</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Visual Column */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 group">
              {hostel.images?.[0] ? (
                <Image 
                  src={hostel.images[0]} 
                  alt={hostel.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image Available</div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {hostel.images?.slice(1, 4).map((img: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <Image src={img} alt={`${hostel.name} view ${i+1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Content Column */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Verified Hostel</span>
              </div>
              <h1 className="text-5xl font-black mb-4 tracking-tight leading-none">{hostel.name}</h1>
              <div className="flex items-center text-gray-500 text-lg">
                <FiMapPin className="mr-2 text-black" />
                <span>{hostel.address || 'Address provided upon booking'}</span>
              </div>
            </div>

            <div className="prose prose-lg prose-gray mb-10">
              <p className="leading-relaxed text-gray-600">{hostel.description}</p>
            </div>

            <div className="mt-auto space-y-6">
               <div className="bg-gray-50/50 backdrop-blur-sm p-8 rounded-[40px] border border-gray-100">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Starting Price</p>
                      <p className="text-5xl font-black italic">¢{hostel.base_price || '---'}</p>
                    </div>
                    <p className="text-gray-400 font-medium">/ semester</p>
                  </div>
                  
                  <Link 
                    href={`/login?redirect=/hostels/${id}`} 
                    className="w-full flex items-center justify-center py-5 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/10 group active:scale-[0.98]"
                  >
                    Check Availability
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white border border-gray-50 shadow-sm">
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><FiCheck /></div>
                    <span className="text-xs font-bold">Secure Booking</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white border border-gray-50 shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FiCheck /></div>
                    <span className="text-xs font-bold">Student Verified</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Structured Info for SEO */}
      <section className="bg-gray-50 py-20 px-6 mt-20 border-t border-gray-100">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <div>
               <h3 className="font-bold mb-4">Location & Access</h3>
               <p className="text-sm text-gray-500">Centrally located with easy access to university campuses. Shuttle services and public transport nearby.</p>
            </div>
            <div>
               <h3 className="font-bold mb-4">Pricing Plans</h3>
               <p className="text-sm text-gray-500">Flexible payment options available via Paystack for students across Ghana.</p>
            </div>
            <div>
               <h3 className="font-bold mb-4">Safety & Security</h3>
               <p className="text-sm text-gray-500">24/7 security surveillance and gated access for peace of mind.</p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 flex items-center justify-between max-w-7xl mx-auto text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <BrandLogo size={20} />
        <p>© 2026 {hostel.name} | Powering Student Housing with AllMap</p>
      </footer>
    </div>
  );
}
