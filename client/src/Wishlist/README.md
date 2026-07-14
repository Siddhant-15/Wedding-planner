# Wishlist System — Customer (JSX + CSS Modules)

Production-ready wishlist (favorites) feature for a wedding services marketplace.
No Tailwind, no UI libraries — pure React + scoped CSS Modules.

## 📁 Structure
```
src/
├── context/
│   └── WishlistContext.jsx        # Global wishlist state + optimistic updates
├── services/
│   └── wishlistApi.js             # Mock + real API (toggle USE_MOCK)
├── components/customer/wishlist/
│   ├── WishlistButton.jsx         # ❤️ heart toggle for service cards
│   ├── WishlistModal.jsx          # Multi-state modal (create-first | pick | create)
│   ├── WishlistCard.jsx           # Wishlist tile (grid item)
│   ├── WishlistGrid.jsx           # Responsive grid + skeletons + empty
│   ├── WishlistItemCard.jsx       # Saved service tile w/ note + priority + move
│   ├── ConfirmDialog.jsx          # Reusable confirm
│   ├── RenameDialog.jsx           # Inline rename modal
│   ├── toast.jsx                  # Lightweight toast host (no provider)
│   └── *.module.css
└── pages/customer/wishlist/
    ├── WishlistsPage.jsx          # /wishlist
    └── WishlistDetailPage.jsx     # /wishlist/:id
```

## 🚀 Setup

### 1. Wrap app with provider
```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastHost } from "./components/customer/wishlist/toast";
import WishlistsPage from "./pages/customer/wishlist/WishlistsPage";
import WishlistDetailPage from "./pages/customer/wishlist/WishlistDetailPage";

export default function App() {
  return (
    <WishlistProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/wishlist" element={<WishlistsPage />} />
          <Route path="/wishlist/:id" element={<WishlistDetailPage />} />
          {/* ...your other routes */}
        </Routes>
      </BrowserRouter>
      <ToastHost />
    </WishlistProvider>
  );
}
```

### 2. Drop the heart button onto any service card
```jsx
import WishlistButton from "@/components/customer/wishlist/WishlistButton";

<div className="serviceCard">
  <WishlistButton service={{
    id: service.id,
    name: service.name,
    image: service.images?.[0],
    location: service.location,
    price: service.starting_price,
    vendor_name: service.vendor?.name,
    service_type: service.service_type, // used to suggest list name
  }} />
  {/* rest of card */}
</div>
```

## 🧠 Behavior Logic (matches spec)
| User state            | Heart click action                                      |
|-----------------------|---------------------------------------------------------|
| 0 wishlists           | Opens **“Create your first wishlist”** modal            |
| 1 wishlist            | Saves directly + toast `Saved to <name>` w/ View action |
| 2+ wishlists          | Opens picker bottom-sheet (mobile) / center modal       |
| Already saved         | Removes + toast w/ **Undo** action                      |

## ✨ UX Details
- **Optimistic UI** — heart fills instantly, rolled back on API failure
- **Bounce animation** on every click (`heartPop` keyframes)
- **Bottom sheet on mobile** (`@media max-width: 600px`) vs centered modal on desktop
- **Auto-suggested list names** by service type (Venues, Catering, Music & DJ, …)
- **Per-item enhancements**: priority (High/Med/Low), private notes, move-to
- **Skeletons** during load, full **empty states** with CTAs
- **Esc-to-close** + body-scroll lock on all modals

## 🔌 API contract
Toggle `USE_MOCK = false` in `src/services/wishlistApi.js` to wire to:
```
GET    /api/wishlists
POST   /api/wishlists                { name, description, isPublic }
GET    /api/wishlists/:id
PATCH  /api/wishlists/:id            { name? , description?, isPublic? }
DELETE /api/wishlists/:id
POST   /api/wishlist/items           { wishlist_id, service_id }
PATCH  /api/wishlist/items/:id       { note?, priority?, wishlist_id? }
DELETE /api/wishlist/items/:id
```
Mock data persists in `localStorage` under key `wishlists_mock_v1`.

## 🎨 Theme
Matches existing customer/admin brand: rose-red accent `#e11d48`, slate text,
soft shadows, 12–16px radii. All colors live inside CSS Modules — swap once
to retheme.
