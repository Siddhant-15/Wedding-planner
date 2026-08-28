// ============================================================
// TEMPORARY MOCK DATA
// None of the values in this file come from a real API. Each
// export is used by a specific vendor page until the matching
// backend endpoint exists — see the comment above each export.
// Replace the corresponding page's usage when the API ships.
// ============================================================

// Replace with GET /vendor/analytics/overview (or similar)
export const kpiMock = {
  profileViews: 2481,
  serviceViews: 4892,
  responseRate: 87, // percent
  avgResponseTime: "1h 24m",
};

// Replace with GET /vendor/services (filtered for admin-flagged items)
// and GET /vendor/profile (completeness check), merged into one feed.
export const actionRequiredMock = [
  {
    id: "ar1",
    title: "Photography Package",
    detail: "Admin requested changes",
    to: "/vendor/services",
  },
  {
    id: "ar2",
    title: "Profile incomplete",
    detail: "Add more portfolio images",
    to: "/vendor/profile",
  },
];

// Replace with GET /vendor/services (status field already exists on
// the real service objects returned by serviceService.getAll() —
// once the backend adds admin-review statuses beyond is_active,
// this can read directly from that response instead of mock data).
export const serviceHealthMock = [
  { id: "sh1", name: "Photography Package", status: "Published" },
  { id: "sh2", name: "Wedding Photography", status: "Changes Requested" },
  { id: "sh3", name: "Pre-Wedding Shoot", status: "Under Review" },
  { id: "sh4", name: "Drone Photography", status: "Draft" },
];

// Replace with GET /vendor/analytics/performance?range=7D|30D|3M|6M|1Y
export const performanceSeriesMock = {
  "7D": [12, 18, 9, 22, 30, 25, 40],
  "30D": [8, 14, 10, 16, 22, 19, 25, 30, 18, 20, 27, 33, 29, 24, 31, 35, 22, 18, 26, 30, 34, 28, 22, 19, 25, 31, 36, 40, 33, 29],
  "3M": [120, 145, 132, 168, 190, 210, 175, 205, 230, 260, 240, 280],
  "6M": [400, 420, 460, 510, 540, 600, 580, 620, 650, 700, 690, 740],
  "1Y": [1200, 1350, 1280, 1420, 1500, 1600, 1550, 1700, 1650, 1800, 1750, 1900],
};

// Replace with GET /vendor/analytics/services
export const servicePerformanceMock = [
  { id: "sp1", name: "Wedding Photography", views: 2341, leads: 48, conversion: "2.05%" },
  { id: "sp2", name: "Pre-Wedding Shoot", views: 1240, leads: 21, conversion: "1.69%" },
  { id: "sp3", name: "Drone Photography", views: 812, leads: 7, conversion: "0.86%" },
];

// Replace with GET /vendor/analytics/funnel?range=...
export const leadFunnelMock = [
  { label: "Leads", value: 128 },
  { label: "Contacted", value: 96 },
  { label: "Responded", value: 71 },
  { label: "Interested", value: 43 },
  { label: "Booked Offline", value: 18 },
];

// Replace with GET /vendor/reviews/summary
export const reviewsSummaryMock = {
  overall: 4.8,
  totalReviews: 128,
  breakdown: {
    Quality: 4.9,
    Communication: 4.7,
    Value: 4.6,
  },
};

// Replace with GET /vendor/reviews
export const reviewsListMock = [
  {
    id: "rv1",
    rating: 5,
    text: "The team was incredibly professional and captured every moment beautifully. Highly recommend for any wedding.",
    author: "Priya Sharma",
    event: "Wedding",
    date: "July 2026",
  },
  {
    id: "rv2",
    rating: 5,
    text: "Great communication throughout and the final gallery exceeded our expectations.",
    author: "Aman Verma",
    event: "Pre-Wedding Shoot",
    date: "June 2026",
  },
  {
    id: "rv3",
    rating: 4,
    text: "Lovely photos overall, delivery took a little longer than expected but worth the wait.",
    author: "Riya Patel",
    event: "Wedding",
    date: "May 2026",
  },
];

// Replace with GET /vendor/profile
export const profileMock = {
  businessName: "",
  about: "",
  contactEmail: "",
  contactPhone: "",
  locations: [],
  portfolioImages: [],
  socialLinks: { instagram: "", website: "" },
  policies: "",
};

// Replace with GET /vendor/profile/completeness (or compute client-side
// from the real profile object once the profile API exists)
export const profileCompletenessMock = {
  percent: 82,
  recommendations: [
    "Add 3 more portfolio images",
    "Add a cancellation policy",
    "Complete your business description",
  ],
};