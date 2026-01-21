import { AuthTab } from "@/types/auth";
import Image from "next/image";

interface HeroSectionProps {
  activeTab: AuthTab;
  onSwitchTab: (tab: AuthTab) => void;
}

const hostelBenefits = [
  "Access to 10,000+ hostels worldwide",
  "Exclusive member discounts",
  "Fast booking with saved preferences",
  "Real-time availability updates",
  "Secure payment & booking history",
];

const heroTexts = {
  login: {
    title: "Welcome Back",
    subtitle:
      "Sign in to manage your hostel bookings and explore new destinations.",
  },
  signup: {
    title: "Join AllmapHostels",
    subtitle:
      "Create an account to book hostels worldwide and unlock exclusive travel perks.",
  },
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeTab,
  onSwitchTab,
}) => {
  return (
    <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 hidden lg:flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-end">
          <Image
            src="/logo/logo.png"
            className="w-12"
            width={12}
            height={12}
            alt=""
          />
          <span className="text-white font-bold text-xl">AllmapHostels</span>
        </div>
        <div className="text-white text-sm">
          {activeTab === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={() =>
              onSwitchTab(activeTab === "login" ? "signup" : "login")
            }
            className="text-[#FF6A00] font-medium hover:underline"
          >
            {activeTab === "login" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {heroTexts[activeTab].title}
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-md">
          {heroTexts[activeTab].subtitle}
        </p>

        <div className="space-y-4">
          {hostelBenefits.map((text, i) => (
            <div key={i} className="flex items-center">
              <div className="w-5 h-5 bg-[#FF6A00] mr-3 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <span className="text-gray-300">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-gray-500 text-sm">
        © 2025 AllmapHostels. All rights reserved.
      </div>
    </div>
  );
};
