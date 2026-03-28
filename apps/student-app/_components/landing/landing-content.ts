import { BRAND } from "@/_components/brand";

export const ADMIN_APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL || "https://admin.allmaphostels.com";

export const LANDING_IMAGES = {
  heroBg: "/photos/hero/des.svg",
  forHostels: "/photos/hero/admin.svg",
  forStudents: "/photos/hero/des.svg",
} as const;

export const landingStats = [
  { value: "420+", label: "Verified Students", sub: "Active Users" },
  { value: "18+", label: "Partner Hostels", sub: "Properties Listed" },
  { value: "98%", label: "Satisfaction Rate", sub: "User Feedback" },
  { value: "3+", label: "Campuses Served", sub: "Nationwide" },
] as const;

export const hostelFeatureList = [
  "Increased student visibility and reach",
  "Secure, timely payment processing",
  "Verified student bookings only",
  "Optimized occupancy rate management",
] as const;

export const studentFeatureList = [
  "Accurate campus proximity filtering",
  "Verified, authentic student reviews",
  "Secure booking and payment system",
  "Safety-verified hostel listings",
] as const;

export const platformAdvantages = [
  {
    title: "Verified Listings",
    body: "All hostels undergo verification to ensure quality and authenticity, providing peace of mind for students.",
  },
  {
    title: "Direct Communication",
    body: "Eliminate middlemen with direct communication between students and hostel owners.",
  },
  {
    title: "Secure Transactions",
    body: "Protected payments with clear booking flows and support when you need it.",
  },
] as const;

export type HowStep = {
  title: string;
  description: string;
  bullets: [string, string, string];
};

export const studentHowSteps: HowStep[] = [
  {
    title: "Verify Your Status",
    description:
      "Sign up and complete your profile so you can book with confidence and access student-focused listings.",
    bullets: [
      "Secure student account",
      "Profile for faster booking",
      "Exclusive student tools",
    ],
  },
  {
    title: "Discover & Filter",
    description:
      "Search hostels with campus proximity, amenities, and budget filters tailored for students.",
    bullets: [
      "Distance and map context",
      "Amenity-based filtering",
      "Price range selection",
    ],
  },
  {
    title: "Review & Compare",
    description:
      "Read verified reviews, browse photos, and compare options side by side before you decide.",
    bullets: [
      "Transparent listing details",
      "Photo galleries",
      "Compare favourites easily",
    ],
  },
  {
    title: "Secure Booking",
    description:
      "Reserve your room with a clear checkout flow and confirmation you can rely on.",
    bullets: [
      "Guided booking steps",
      "Booking confirmation",
      "Support if something changes",
    ],
  },
];

export const hostelHowSteps: HowStep[] = [
  {
    title: "Property Registration",
    description:
      "Create your hostel profile with photos, amenities, and room types students care about.",
    bullets: ["Property details", "Amenity inventory", "Photo gallery"],
  },
  {
    title: "Verification",
    description:
      "Work with our team to verify your listing so students trust what they see.",
    bullets: ["Document checks", "Quality standards", "Trusted badge"],
  },
  {
    title: "Listing Management",
    description:
      "Update availability, pricing, and offers from your owner dashboard.",
    bullets: ["Availability control", "Pricing updates", "Booking visibility"],
  },
  {
    title: "Payments",
    description: "Receive payouts according to your plan with clear reporting.",
    bullets: ["Secure gateway", "Payout tracking", "Financial clarity"],
  },
];

export type BenefitSlide = {
  id: number;
  studentTitle: string;
  studentDescription: string;
  studentBullets: [string, string, string];
  hostelTitle: string;
  hostelDescription: string;
  hostelBullets: [string, string, string];
};

export const benefitSlides: BenefitSlide[] = [
  {
    id: 1,
    studentTitle: "Verification & trust",
    studentDescription:
      "Listings are reviewed so you spend less time worrying about scams and more time choosing the right room.",
    studentBullets: [
      "Verified hostel listings",
      "Authentic student reviews",
      "Clear pricing expectations",
    ],
    hostelTitle: "Direct student access",
    hostelDescription:
      "Reach students who are actively searching for accommodation near campus.",
    hostelBullets: [
      "Qualified student audience",
      "No traditional agent cuts on-platform",
      "Tools to showcase your property",
    ],
  },
  {
    id: 2,
    studentTitle: "Transparent information",
    studentDescription:
      "Amenities, rules, and photos are structured so you know what you are booking.",
    studentBullets: [
      "Detailed amenity lists",
      "Clear fee breakdowns where shown",
      "Consistent listing layout",
    ],
    hostelTitle: "Streamlined management",
    hostelDescription:
      "Keep your listing accurate and respond to demand with less manual back-and-forth.",
    hostelBullets: [
      "Dashboard-first operations",
      "Availability clarity",
      "Less repetitive enquiries",
    ],
  },
  {
    id: 3,
    studentTitle: "Smart comparison",
    studentDescription:
      "Compare distance, price, and amenities to shortlist hostels faster.",
    studentBullets: [
      "Filter by budget",
      "Campus proximity context",
      "Amenity matching",
    ],
    hostelTitle: "Secure transactions",
    hostelDescription:
      "Payments and booking flows are built to reduce disputes and confusion.",
    hostelBullets: [
      "Defined payment milestones",
      "Documentation-friendly flow",
      "Dispute support",
    ],
  },
  {
    id: 4,
    studentTitle: "Location intelligence",
    studentDescription:
      "Maps and distance context help you pick a hostel that fits your commute.",
    studentBullets: [
      "Map-backed context",
      "Neighbourhood cues",
      "Less guesswork",
    ],
    hostelTitle: "Visibility near campus",
    hostelDescription:
      "Show up when students search near your university catchment.",
    hostelBullets: [
      "Search-friendly profiles",
      "Campus-centric discovery",
      "Strong first impression",
    ],
  },
];

export const studentFaqs = [
  {
    question: "How do I verify a hostel's authenticity?",
    answer:
      "All hostels on AllMap Hostels go through a verification process. You can read student reviews, inspect photos, and review listing details before you book. Our team works with owners to keep information accurate.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellation rules depend on the hostel and room type. You will see the policy on the listing and again at checkout. If you are unsure, contact support before you pay.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Supported methods are shown at checkout. We prioritise secure flows and clear receipts so you know your payment status.",
  },
  {
    question: "Can I visit a property before booking?",
    answer:
      "Yes, when the hostel allows viewings you can arrange them directly. Use listing photos, maps, and reviews to narrow options first.",
  },
  {
    question: "What if there is an issue with my room?",
    answer:
      "Report problems through the app and our team will help coordinate with the hostel. For urgent safety issues, follow local emergency guidance first, then notify us.",
  },
] as const;

export const ownerFaqs = [
  {
    question: "How do I list my hostel?",
    answer:
      "Create an account on the owner platform, complete your property profile, and submit it for review. We will guide you through photos, pricing, and availability.",
  },
  {
    question: "Are there platform fees?",
    answer:
      "Fees depend on your plan and region. You will see costs before you go live—no surprise charges hidden in small print.",
  },
  {
    question: "How do I manage bookings?",
    answer:
      "Use the owner dashboard to track enquiries, confirmations, and payouts. Notifications help you respond quickly to students.",
  },
  {
    question: "How are payouts handled?",
    answer:
      "Payout timing and methods are configured in your dashboard. You receive statements you can use for accounting.",
  },
  {
    question: "How do I get more visibility?",
    answer:
      "Complete profiles with quality photos, accurate amenities, and competitive pricing perform best. We surface listings that students can trust.",
  },
] as const;

export const homeJsonLdDescription = BRAND.description;
