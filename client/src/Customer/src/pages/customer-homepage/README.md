# Customer HomePage — JSX + CSS Modules

A modern, responsive, production-ready customer landing page for a wedding/event service booking platform.

## 📁 Folder Structure

```
src/
├── pages/customer/
│   ├── HomePage.jsx
│   └── HomePage.module.css
├── components/customer/home/
│   ├── HeroSection.jsx / .module.css
│   ├── CategorySection.jsx / .module.css
│   ├── CategoryCard.jsx / .module.css
│   ├── ServiceSection.jsx / .module.css
│   ├── ServiceCard.jsx / .module.css
│   ├── ServiceCardSkeleton.jsx / .module.css
│   └── CTASection.jsx / .module.css
└── services/
    └── homeApi.js
```

## 🔌 Wiring it up

```jsx
// In your router
import HomePage from "@/pages/customer/HomePage";

<Route path="/home" element={<HomePage user={currentUser} />} />
```

The `user` prop is optional. `user.city` is used to title the "Popular in your city" section.

## 🌐 API

`src/services/homeApi.js` exposes:
- `fetchFeaturedServices()`
- `fetchPopularServices(city)`
- `fetchRecommendedServices()`

By default it returns **mock data** (set `USE_MOCK = false` to call your backend).
Set `VITE_API_BASE_URL` in your `.env` to override the base URL.

Each service object follows:
```ts
{
  id: string|number,
  name: string,
  images: string[],
  area?: string,
  city?: string,
  service_type?: "venue" | "catering" | "photography" | "decoration" | "dj" | "event_planner",
  starting_price?: number,   // INR
  rating?: number            // 0-5
}
```

## 🧩 Dependencies

- `react`
- `react-router-dom` (`useNavigate`)
- `lucide-react` (icons)

No Tailwind, no UI libraries — pure CSS Modules.

## 📱 Responsive breakpoints

- ≥1100px: 4-col service grid, 6-col category grid
- ≥820px:  3-col service grid, 3-col category grid
- ≥520px:  2-col service grid, 2-col category grid
- <520px:  single column

## ✅ Includes

- Loading skeletons
- Empty + error states with retry
- Image fallback
- Wishlist toggle on cards
- Search bar (location + service + date) → `/services?...`
- Category navigation → `/services?type=<category>`
- Service navigation → `/service/:id`
- A11y labels and keyboard support
