import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin } from 'react-icons/fi';
import { BrandLogo } from '@/_components/brand';

interface PublicHostel {
  id: string;
  name: string;
  description: string;
  address?: string;
  base_price?: number;
  images?: string[];
}

async function getHostels(): Promise<PublicHostel[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
  try {
    const res = await fetch(`${apiUrl}/public/hostels`, {
      next: { revalidate: 0 }
    });
    if (!res.ok) return [];
    return res.json() as Promise<PublicHostel[]>;
  } catch (error) {
    console.error('Error fetching hostels:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Browse Hostels | AllMap Hostels',
  description: 'Explore the best student hostels near your campus. Verified listings with transparent pricing and student reviews.',
};

export default async function HostelsListPage() {
  const hostels = await getHostels();

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans">
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
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight">Available Hostels</h1>
          <p className="text-gray-500 max-w-2xl">Discover and compare verified student accommodations across Ghana. Find your perfect home near campus.</p>
        </div>

        {hostels.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hostels found at the moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hostels.map((hostel) => (
              <div
                key={hostel.id}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 relative"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {hostel.images?.[0] ? (
                    <Image
                      src={hostel.images[0]}
                      alt={hostel.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300 italic">No image</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Verified
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">
                    <Link href={`/login`} className="after:absolute after:inset-0">
                      {hostel.name}
                    </Link>
                  </h2>
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <FiMapPin className="mr-1" />
                    <span className="truncate">{hostel.address || 'Location Verified'}</span>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Starting from</p>
                      <p className="text-2xl font-black italic">¢{hostel.base_price || '---'}</p>
                    </div>
                    <Link href='/login' className="relative z-10 w-10 h-10 bg-black font-semibold px-8 rounded-xl flex items-center justify-center text-white transform transition-transform">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 flex items-center justify-between max-w-7xl mx-auto text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <BrandLogo size={20} />
        <p>© 2026 AllMap Hostels | The #1 Student Housing Platform</p>
      </footer>
    </div>
  );
}
