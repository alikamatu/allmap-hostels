"use client";

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiShield, FiHeart, FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi';
import { BrandLogo, BRAND } from '@/_components/brand';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo size={36} />
          </Link>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="#features" className="hover:text-gray-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-gray-600 transition-colors">How it Works</Link>
            <Link href="/login" className="px-5 py-2 hover:bg-gray-50 rounded-full transition-colors border border-gray-200">Sign In</Link>
            <Link href="/login?tab=signup" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-sm">Get Started</Link>
          </div>
          {/* Mobile menu button could go here */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={BRAND.heroImage}
            alt="Students on campus"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-gray-50/60 to-transparent" />
        <div className="absolute top-20 left-1/4 -z-10 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl opacity-50 animate-pulse" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-gray-100/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-black rounded-full" />
              <span>The #1 Student Hostel Platform</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-bold leading-tight mb-8">
              Find Your Perfect <br />
              <span className="text-gray-400 italic font-serif">Student Home.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              {BRAND.description}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/hostels" className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 group text-sm uppercase tracking-widest">
                Browse Hostels
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-center bg-white/60 backdrop-blur-sm">
                Sign In
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-12 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <p>Trusted by <span className="text-black font-bold">2,000+</span> students across Ghana</p>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl skew-y-1">
              <Image 
                src={BRAND.heroImage}
                alt="Students on campus" 
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
            
            {/* Floating Element 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 bg-white p-6 shadow-xl rounded-2xl z-20 hidden sm:block"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <FiCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Availability</p>
                  <p className="font-bold text-sm">Room Verified</p>
                </div>
              </div>
            </motion.div>
            
            {/* Floating Element 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 bg-white p-6 shadow-xl rounded-2xl z-20 hidden sm:block border border-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="font-bold text-sm">2 min to Campus</p>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative circles */}
            <div className="absolute -z-10 -bottom-20 -right-20 w-64 h-64 border border-gray-100 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything a student needs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We make finding and booking your next stay as simple as ordering a pizza.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiSearch className="h-6 w-6" />,
                title: "Smart Search",
                desc: "Filter by price, amenities, and distance to your lecture halls."
              },
              {
                icon: <FiShield className="h-6 w-6" />,
                title: "Verified Hostels",
                desc: "Every hostel on our platform is physically verified by our team."
              },
              {
                icon: <FiHeart className="h-6 w-6" />,
                title: "Student Community",
                desc: "Connect with future roommates and see honest student reviews."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all"
              >
                <div className="bg-black text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">How it works</h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Search and Filter", desc: "Browse through hundreds of hostels verified for students." },
                  { step: "02", title: "View and Compare", desc: "See detailed photos, amenities list, and read verified reviews." },
                  { step: "03", title: "Book and Secure", desc: "Pay securely online and receive your confirmation instantly." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-6">
                    <span className="text-5xl font-black text-gray-100 font-serif">{item.step}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 rounded-3xl p-12 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Image src={BRAND.logo.src} alt="" width={256} height={256} className="rounded-3xl" />
               </div>
               <h3 className="text-3xl font-bold mb-6 relative z-10">Join thousands of students booking today.</h3>
               <p className="text-gray-400 mb-10 relative z-10">Stop the stress of manual hostel hunting. Book your next home with confidence.</p>
               <Link href="/login?tab=signup" className="inline-flex items-center px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all relative z-10">
                 Get Started Now
                 <FiArrowRight className="ml-2" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 tracking-tight">Ready to find your <br /> next stay?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login?tab=signup" className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-black/10">
              Create Free Account
            </Link>
          </div>
          <p className="mt-8 text-gray-500 text-sm">No credit card required to browse.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center space-x-2 text-black mb-6 md:mb-0">
            <BrandLogo size={24} />
          </div>
          <p>{BRAND.copyright}</p>
          <div className="flex space-x-6 mt-6 md:mt-0">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}