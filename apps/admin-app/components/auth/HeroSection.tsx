import { AuthTab } from '@/types/auth';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  BarChart3,
  Banknote,
  CreditCard,
  Star,
  User,
} from 'lucide-react';

interface HeroSectionProps {
  activeTab: AuthTab;
  onSwitchTab: (tab: AuthTab) => void;
}

const adminFeatures = [
  {
    Icon: Building2,
    text: 'Manage all your hostel listings in one place',
  },
  {
    Icon: BarChart3,
    text: 'Real-time booking analytics & revenue tracking',
  },
  {
    Icon: Banknote,
    text: 'GHS 35 commission per confirmed student booking',
  },
  {
    Icon: CreditCard,
    text: 'Instant payouts via MoMo or bank transfer',
  },
  {
    Icon: Star,
    text: 'Guest reviews & reputation management tools',
  },
];

const heroContent = {
  login: {
    headline: 'Welcome back,\nAdmin',
    sub: 'Manage your hostels, track earnings,\nand handle bookings — all from one dashboard.',
  },
  signup: {
    headline: 'List Your Hostel\nwith AllmapHostels',
    sub: 'Join hostel owners across Ghana earning commissions\nfrom verified student bookings every day.',
  },
};

const trustAvatars = [
  { initials: 'KA', color: 'bg-emerald-500' },
  { initials: 'EO', color: 'bg-blue-500' },
  { initials: 'MS', color: 'bg-orange-500' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeTab,
  onSwitchTab,
}) => {
  const content = heroContent[activeTab];

  return (
    <div className="hidden lg:flex w-[46%] xl:w-[44%] flex-col justify-between relative overflow-hidden bg-[#0d0d0d]">
      {/* Hostel background image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/hostel-hero.jpg"
          alt="Hostel interior"
          fill
          className="object-cover opacity-25"
          priority
          sizes="46vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/0 to-[#0d0d0d]/10" />
      </div>

      {/* Orange glow */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6A00]/15 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-10 xl:px-14 pt-10 xl:pt-12">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FF6A00] rounded-xl flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo/logo.png"
              width={20}
              height={20}
              alt="AllmapHostels logo"
              className="object-contain"
            />
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight">
            AllmapHostels
          </span>
          <span className="text-[10px] text-[#FF6A00] font-bold bg-[#FF6A00]/10 border border-[#FF6A00]/25 rounded-md px-1.5 py-0.5 uppercase tracking-widest">
            Admin
          </span>
        </div>

        <div className="text-gray-400 text-sm">
          {activeTab === 'login' ? 'New here?' : 'Have an account?'}{' '}
          <button
            type="button"
            onClick={() =>
              onSwitchTab(activeTab === 'login' ? 'signup' : 'login')
            }
            className="text-[#FF6A00] font-semibold hover:brightness-125 transition-all"
          >
            {activeTab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>

      {/* ── Main copy + features ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-10 xl:px-14 pb-10 xl:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <h1 className="text-4xl xl:text-[46px] font-extrabold text-white leading-[1.15] tracking-tight whitespace-pre-line mb-3">
              {content.headline}
            </h1>
            <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line mb-9">
              {content.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Feature list */}
        <div className="space-y-3 mb-10">
          {adminFeatures.map(({ Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#FF6A00]" strokeWidth={2} />
              </div>
              <span className="text-gray-300 text-[13.5px]">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/8 rounded-2xl w-fit backdrop-blur-sm">
          <div className="flex -space-x-2">
            {trustAvatars.map(({ initials, color }) => (
              <div
                key={initials}
                className={`w-8 h-8 rounded-full border-2 border-[#0d0d0d] flex items-center justify-center ${color}`}
              >
                <User className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold">
              500+ hostel admins
            </p>
            <p className="text-gray-500 text-[11px]">earning on AllmapHostels</p>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-8">
          &copy; {new Date().getFullYear()} AllmapHostels. All rights reserved.
        </p>
      </div>
    </div>
  );
};
