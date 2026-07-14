export const mockVendor = {
  id: "v_001",
  name: "Royal Garden Banquets",
  category: "Wedding Venue",
  city: "Mumbai",
  image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
  rating: 4.8,
  reviews: 234,
  responseTime: "Usually responds within 24 hours",
  phone: "9876543210",
};

export const eventTypes = ["Wedding", "Engagement", "Reception", "Sangeet", "Mehendi", "Birthday", "Corporate"];
export const budgetRanges = ["Under ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000 - ₹3,00,000", "₹3,00,000 - ₹5,00,000", "Above ₹5,00,000"];

export const mockRequest = {
  id: "REQ_2026_001",
  status: "VENDOR_REVIEWING",
  submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  eventType: "Wedding",
  eventDate: "2026-12-15",
  budget: "₹3,00,000 - ₹5,00,000",
  guestCount: 350,
  city: "Mumbai",
  notes: "Looking for an outdoor venue with valet parking and in-house catering options.",
  vendor: mockVendor,
};

export const mockLeads = [
  {
    id: "LD_001", customerName: "Priya Sharma", eventType: "Wedding",
    eventDate: "2026-12-15", budget: "₹3,00,000 - ₹5,00,000", city: "Mumbai",
    guestCount: 350, notes: "Outdoor venue preferred with parking.",
    phone: "9876543210", status: "NEW", receivedAt: "2 hours ago",
  },
  {
    id: "LD_002", customerName: "Rahul Verma", eventType: "Reception",
    eventDate: "2026-11-20", budget: "₹1,00,000 - ₹3,00,000", city: "Pune",
    guestCount: 200, notes: "Need DJ and decoration included.",
    phone: "9123456789", status: "ACCEPTED", receivedAt: "5 hours ago",
  },
  {
    id: "LD_003", customerName: "Anjali Mehta", eventType: "Sangeet",
    eventDate: "2026-10-10", budget: "₹50,000 - ₹1,00,000", city: "Mumbai",
    guestCount: 100, notes: "Looking for vibrant decor and live music.",
    phone: "9988776655", status: "UNLOCKED", receivedAt: "1 day ago",
  },
  {
    id: "LD_004", customerName: "Vikram Singh", eventType: "Wedding",
    eventDate: "2026-09-05", budget: "Above ₹5,00,000", city: "Delhi",
    guestCount: 500, notes: "Premium 5-star venue required.",
    phone: "9876512340", status: "WON", receivedAt: "3 days ago",
  },
];

export const leadStats = {
  newLeads: 12, accepted: 8, unlocked: 5, won: 3,
};

export const subscriptionPlans = [
  { id: "free", name: "Free", price: 0, unlocks: 3,
    features: ["3 unlocks per day", "Basic profile", "Email support"], cta: "Continue Free" },
  { id: "starter", name: "Starter", price: 499, unlocks: 5,
    features: ["5 unlocks per day", "Priority support", "Verified badge"], cta: "Upgrade to Starter", recommended: true },
  { id: "premium", name: "Premium", price: 999, unlocks: 15,
    features: ["15 unlocks per day", "Featured listing", "Priority ranking", "Dedicated manager"], cta: "Go Premium" },
];
