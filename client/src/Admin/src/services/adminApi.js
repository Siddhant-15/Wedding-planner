/**
 * Admin API layer.
 * Toggle USE_MOCK = false to use a real backend.
 * All functions return Promises and reject on errors.
 */
const USE_MOCK = true;
const BASE_URL = import.meta?.env?.VITE_ADMIN_API_URL || "/api/admin";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (data, ms = 350) => sleep(ms).then(() => structuredClone(data));

/* ---------- MOCK DATA ---------- */
const mock = {
  metrics: {
    totalUsers: 2840,
    totalVendors: 187,
    activeServices: 312,
    pendingApprovals: 14,
    bookingsThisMonth: 426,
    revenueThisMonth: 1840000,
  },
  activity: [
    { id: 1, type: "service_approved", text: "Royal Wedding Palace approved", at: "2026-04-23T10:14:00Z" },
    { id: 2, type: "vendor_signup", text: "New vendor Spice Studio joined", at: "2026-04-23T08:42:00Z" },
    { id: 3, type: "review_flagged", text: "Review #482 flagged for moderation", at: "2026-04-22T19:05:00Z" },
    { id: 4, type: "booking_cancelled", text: "Booking #1029 cancelled by customer", at: "2026-04-22T16:30:00Z" },
    { id: 5, type: "service_rejected", text: "DJ Beatbox rejected (incomplete info)", at: "2026-04-22T11:11:00Z" },
  ],
  vendors: [
    { id: "v1", name: "Royal Palace Group", email: "contact@royalpalace.in", phone: "+91 98765 43210", city: "Jaipur", status: "verified", services: 4, joinedAt: "2025-12-12" },
    { id: "v2", name: "Spice Studio Catering", email: "hello@spicestudio.in", phone: "+91 98111 22233", city: "Delhi", status: "pending", services: 2, joinedAt: "2026-04-10" },
    { id: "v3", name: "Lens Stories", email: "team@lensstories.in", phone: "+91 90909 80808", city: "Mumbai", status: "verified", services: 6, joinedAt: "2025-09-04" },
    { id: "v4", name: "Beatbox DJ Co.", email: "book@beatbox.in", phone: "+91 99887 76655", city: "Bengaluru", status: "suspended", services: 1, joinedAt: "2025-07-21" },
    { id: "v5", name: "Glow Makeup Artistry", email: "glow@artistry.in", phone: "+91 98222 11100", city: "Pune", status: "verified", services: 3, joinedAt: "2026-01-18" },
  ],
  services: [
    { id: "s1", name: "Royal Wedding Palace", vendor: "Royal Palace Group", category: "venue", city: "Jaipur", price: 250000, status: "active", featured: true, createdAt: "2026-03-01", images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900"], description: "Heritage palace with grand ballrooms and lush gardens.", tags: ["Heritage","Outdoor","Parking"] },
    { id: "s2", name: "Spice Studio Premium Catering", vendor: "Spice Studio Catering", category: "catering", city: "Delhi", price: 1200, status: "pending", featured: false, createdAt: "2026-04-15", images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=900"], description: "Premium multi-cuisine catering with live counters.", tags: ["Veg","Non-veg","Live Counter"] },
    { id: "s3", name: "Lens Stories Wedding Films", vendor: "Lens Stories", category: "photography", city: "Mumbai", price: 85000, status: "active", featured: true, createdAt: "2026-02-12", images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=900"], description: "Cinematic wedding films and candid photography.", tags: ["Cinematic","Drone","Album"] },
    { id: "s4", name: "Beatbox DJ Night", vendor: "Beatbox DJ Co.", category: "dj", city: "Bengaluru", price: 35000, status: "rejected", featured: false, createdAt: "2026-04-02", images: ["https://images.unsplash.com/photo-1571266028243-d220bc5d54a4?w=900"], description: "High-energy DJ with full sound + lighting setup.", tags: ["Lights","Sound"], rejectionReason: "Incomplete equipment list" },
    { id: "s5", name: "Glow Bridal Makeup", vendor: "Glow Makeup Artistry", category: "makeup", city: "Pune", price: 22000, status: "flagged", featured: false, createdAt: "2026-04-19", images: ["https://images.unsplash.com/photo-1522335789203-aaa83a55afea?w=900"], description: "Bridal HD makeup with airbrush option.", tags: ["HD","Airbrush"] },
    { id: "s6", name: "Velvet Banquet Hall", vendor: "Royal Palace Group", category: "venue", city: "Jaipur", price: 150000, status: "active", featured: false, createdAt: "2026-01-22", images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900"], description: "Elegant banquet for up to 400 guests.", tags: ["Indoor","AC"] },
  ],
  bookings: [
    { id: "b1001", customer: "Ananya Mehta", service: "Royal Wedding Palace", date: "2026-06-12", amount: 250000, status: "confirmed" },
    { id: "b1002", customer: "Rahul Singh", service: "Lens Stories Wedding Films", date: "2026-05-28", amount: 85000, status: "pending" },
    { id: "b1003", customer: "Priya Kapoor", service: "Spice Studio Premium Catering", date: "2026-07-04", amount: 240000, status: "confirmed" },
    { id: "b1004", customer: "Vikram Joshi", service: "Beatbox DJ Night", date: "2026-05-10", amount: 35000, status: "cancelled" },
    { id: "b1005", customer: "Neha Sharma", service: "Glow Bridal Makeup", date: "2026-06-02", amount: 22000, status: "pending" },
  ],
  reviews: [
    { id: "r1", customer: "Ananya Mehta", service: "Royal Wedding Palace", rating: 5, text: "Absolutely magical venue, great staff!", images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400"], status: "pending", createdAt: "2026-04-20" },
    { id: "r2", customer: "Rahul Singh", service: "Lens Stories Wedding Films", rating: 4, text: "Loved the cinematic film. Album took 3 weeks though.", images: [], status: "approved", createdAt: "2026-04-18" },
    { id: "r3", customer: "Anonymous", service: "Beatbox DJ Night", rating: 1, text: "Worst experience. Spammy text follows...", images: [], status: "flagged", createdAt: "2026-04-15" },
    { id: "r4", customer: "Priya Kapoor", service: "Spice Studio Premium Catering", rating: 5, text: "Food was outstanding!", images: [], status: "pending", createdAt: "2026-04-22" },
  ],
  reports: [
    { id: "rep1", targetType: "service", targetName: "Beatbox DJ Night", reason: "Misleading pricing", reportedBy: "user@example.com", status: "open", createdAt: "2026-04-21" },
    { id: "rep2", targetType: "review", targetName: "Review r3", reason: "Abusive language", reportedBy: "vendor@beatbox.in", status: "open", createdAt: "2026-04-22" },
    { id: "rep3", targetType: "vendor", targetName: "Beatbox DJ Co.", reason: "Multiple complaints", reportedBy: "system", status: "resolved", createdAt: "2026-04-10" },
  ],
  categories: [
    { id: "c1", name: "Venue", slug: "venue", active: true },
    { id: "c2", name: "Catering", slug: "catering", active: true },
    { id: "c3", name: "Photography", slug: "photography", active: true },
    { id: "c4", name: "Decoration", slug: "decoration", active: true },
    { id: "c5", name: "DJ / Music", slug: "dj", active: true },
    { id: "c6", name: "Event Planner", slug: "event-planner", active: true },
    { id: "c7", name: "Makeup Artist", slug: "makeup", active: true },
  ],
  settings: { autoApproveServices: false, autoApproveReviews: false, requireVendorKYC: true },
};

/* ---------- HELPERS ---------- */
async function realFetch(path, opts = {}) {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

/* ---------- AUTH ---------- */
export const adminApi = {
  async login({ email, password }) {
    if (USE_MOCK) {
      await sleep(450);
      if (email === "admin@platform.com" && password === "admin123") {
        return { token: "mock.admin.jwt." + Date.now(), user: { id: "a1", name: "Platform Admin", email, role: "admin" } };
      }
      throw new Error("Invalid credentials. Try admin@platform.com / admin123");
    }
    return realFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  /* Dashboard */
  getMetrics: () => USE_MOCK ? ok(mock.metrics) : realFetch("/metrics"),
  getActivity: () => USE_MOCK ? ok(mock.activity) : realFetch("/activity"),

  /* Vendors */
  getVendors: () => USE_MOCK ? ok(mock.vendors) : realFetch("/vendors"),
  updateVendor: (id, patch) => {
    if (USE_MOCK) {
      const v = mock.vendors.find((x) => x.id === id);
      if (v) Object.assign(v, patch);
      return ok(v);
    }
    return realFetch(`/vendors/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  /* Services */
  getServices: () => USE_MOCK ? ok(mock.services) : realFetch("/services"),
  updateService: (id, patch) => {
    if (USE_MOCK) {
      const s = mock.services.find((x) => x.id === id);
      if (s) Object.assign(s, patch);
      return ok(s);
    }
    return realFetch(`/services/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  /* Bookings */
  getBookings: () => USE_MOCK ? ok(mock.bookings) : realFetch("/bookings"),
  updateBooking: (id, patch) => {
    if (USE_MOCK) {
      const b = mock.bookings.find((x) => x.id === id);
      if (b) Object.assign(b, patch);
      return ok(b);
    }
    return realFetch(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  /* Reviews */
  getReviews: () => USE_MOCK ? ok(mock.reviews) : realFetch("/reviews"),
  updateReview: (id, patch) => {
    if (USE_MOCK) {
      const r = mock.reviews.find((x) => x.id === id);
      if (r) Object.assign(r, patch);
      return ok(r);
    }
    return realFetch(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },
  deleteReview: (id) => {
    if (USE_MOCK) {
      const i = mock.reviews.findIndex((x) => x.id === id);
      if (i >= 0) mock.reviews.splice(i, 1);
      return ok({ ok: true });
    }
    return realFetch(`/reviews/${id}`, { method: "DELETE" });
  },

  /* Reports */
  getReports: () => USE_MOCK ? ok(mock.reports) : realFetch("/reports"),
  updateReport: (id, patch) => {
    if (USE_MOCK) {
      const r = mock.reports.find((x) => x.id === id);
      if (r) Object.assign(r, patch);
      return ok(r);
    }
    return realFetch(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
  },

  /* Categories / Settings */
  getCategories: () => USE_MOCK ? ok(mock.categories) : realFetch("/categories"),
  saveCategory: (cat) => {
    if (USE_MOCK) {
      if (cat.id) {
        const c = mock.categories.find((x) => x.id === cat.id);
        if (c) Object.assign(c, cat);
      } else {
        mock.categories.push({ ...cat, id: "c" + (mock.categories.length + 1) });
      }
      return ok(mock.categories);
    }
    return realFetch(`/categories`, { method: "POST", body: JSON.stringify(cat) });
  },
  deleteCategory: (id) => {
    if (USE_MOCK) {
      const i = mock.categories.findIndex((x) => x.id === id);
      if (i >= 0) mock.categories.splice(i, 1);
      return ok(mock.categories);
    }
    return realFetch(`/categories/${id}`, { method: "DELETE" });
  },
  getSettings: () => USE_MOCK ? ok(mock.settings) : realFetch("/settings"),
  saveSettings: (patch) => {
    if (USE_MOCK) { Object.assign(mock.settings, patch); return ok(mock.settings); }
    return realFetch("/settings", { method: "PATCH", body: JSON.stringify(patch) });
  },

  /* Analytics */
  getAnalytics: () => {
    if (USE_MOCK) {
      return ok({
        topServices: [
          { name: "Royal Wedding Palace", bookings: 42 },
          { name: "Lens Stories Wedding Films", bookings: 35 },
          { name: "Spice Studio Premium Catering", bookings: 31 },
          { name: "Velvet Banquet Hall", bookings: 24 },
          { name: "Glow Bridal Makeup", bookings: 18 },
        ],
        topVendors: [
          { name: "Royal Palace Group", bookings: 66 },
          { name: "Lens Stories", bookings: 35 },
          { name: "Spice Studio Catering", bookings: 31 },
          { name: "Glow Makeup Artistry", bookings: 18 },
        ],
        bookingsByMonth: [
          { m: "Nov", v: 280 }, { m: "Dec", v: 340 }, { m: "Jan", v: 360 },
          { m: "Feb", v: 410 }, { m: "Mar", v: 395 }, { m: "Apr", v: 426 },
        ],
      });
    }
    return realFetch("/analytics");
  },
};
