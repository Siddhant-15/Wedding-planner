/**
 * Customer Home API service.
 * Replace BASE_URL and the fetch calls with your real backend.
 * Each function returns a Promise<Service[]>.
 *
 * Service shape:
 * {
 *   id: string|number,
 *   name: string,
 *   images: string[],
 *   area?: string,
 *   city?: string,
 *   service_type?: string,
 *   starting_price?: number,
 *   rating?: number,
 * }
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/api";
const USE_MOCK = true; // Flip to false when wiring real API.

const MOCK_IMAGES = {
  venue: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
  ],
  catering: [
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
  ],
  photography: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  ],
  decoration: [
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=80",
  ],
  dj: [
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=900&q=80",
  ],
  event_planner: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  ],
};

const mockService = (id, overrides = {}) => ({
  id,
  name: "Royal Wedding Palace",
  images: MOCK_IMAGES.venue,
  area: "Amer Fort Road",
  city: "Jaipur",
  service_type: "venue",
  starting_price: 125000,
  rating: 4.7,
  ...overrides,
});

const MOCK_FEATURED = [
  mockService("f1"),
  mockService("f2", {
    name: "Spice Route Catering",
    service_type: "catering",
    images: MOCK_IMAGES.catering,
    area: "Bandra West",
    city: "Mumbai",
    starting_price: 850,
    rating: 4.6,
  }),
  mockService("f3", {
    name: "Lens Story Studios",
    service_type: "photography",
    images: MOCK_IMAGES.photography,
    area: "Indiranagar",
    city: "Bengaluru",
    starting_price: 65000,
    rating: 4.9,
  }),
  mockService("f4", {
    name: "Bloom Decor Co.",
    service_type: "decoration",
    images: MOCK_IMAGES.decoration,
    area: "Saket",
    city: "Delhi",
    starting_price: 45000,
    rating: 4.5,
  }),
];

const MOCK_POPULAR = [
  mockService("p1", {
    name: "Heritage Haveli",
    area: "Civil Lines",
    starting_price: 180000,
    rating: 4.8,
  }),
  mockService("p2", {
    name: "Beats by Arjun",
    service_type: "dj",
    images: MOCK_IMAGES.dj,
    area: "C-Scheme",
    starting_price: 35000,
    rating: 4.7,
  }),
  mockService("p3", {
    name: "Pink City Planners",
    service_type: "event_planner",
    images: MOCK_IMAGES.event_planner,
    area: "Malviya Nagar",
    starting_price: 90000,
    rating: 4.6,
  }),
  mockService("p4", {
    name: "Garden Mandap",
    area: "Vaishali Nagar",
    starting_price: 110000,
    rating: 4.4,
  }),
];

const MOCK_RECOMMENDED = [
  mockService("r1", {
    name: "Sunset Banquet",
    starting_price: 95000,
    rating: 4.5,
  }),
  mockService("r2", {
    name: "Royal Rasoi Catering",
    service_type: "catering",
    images: MOCK_IMAGES.catering,
    starting_price: 700,
    rating: 4.4,
  }),
  mockService("r3", {
    name: "Frame & Co. Photography",
    service_type: "photography",
    images: MOCK_IMAGES.photography,
    starting_price: 55000,
    rating: 4.7,
  }),
  mockService("r4", {
    name: "Petals & Lights",
    service_type: "decoration",
    images: MOCK_IMAGES.decoration,
    starting_price: 40000,
    rating: 4.6,
  }),
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const safeFetch = async (url) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data?.services || data || [];
};

export const fetchFeaturedServices = async () => {
  if (USE_MOCK) {
    await wait(500);
    return MOCK_FEATURED;
  }
  return safeFetch(`${BASE_URL}/services/featured`);
};

export const fetchPopularServices = async (city = "") => {
  if (USE_MOCK) {
    await wait(500);
    return MOCK_POPULAR.map((s) => ({ ...s, city: city || s.city }));
  }
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";
  return safeFetch(`${BASE_URL}/services/popular${qs}`);
};

export const fetchRecommendedServices = async () => {
  if (USE_MOCK) {
    await wait(500);
    return MOCK_RECOMMENDED;
  }
  return safeFetch(`${BASE_URL}/services/recommended`);
};
