# Customer Service Module

Production-ready customer-side service browsing experience.
**JSX + CSS Modules**, themed with HSL semantic tokens.

## Folder structure
```
src/
├── components/customer/
│   ├── cards/         # ServiceCard, FilterSidebar, VariantsCard, AddressCard, AmenitiesCard, VendorCard
│   ├── specs/         # VenueSpecsCard, CateringSpecsCard, PhotographySpecsCard, GenericSpecsCard
│   ├── gallery/       # ImageGallery (with lightbox)
│   ├── forms/         # AvailabilityForm
│   ├── reviews/       # ReviewsList, WriteReviewForm
│   └── styles/        # All component .module.css files
├── pages/customer/
│   ├── ServicesListing.jsx + .module.css
│   └── ServiceDetail.jsx + .module.css
├── context/AuthContext.jsx           # Minimal stub for review form
├── utils/format.js                   # currency/address helpers
├── utils/customerMockData.js         # mock API + sample services for all service types
├── utils/api/services/review.service.js  # review submit stub
└── styles/theme.module.css           # OPTIONAL: HSL token reference
```

## Wiring it up
```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ServicesListing from "./pages/customer/ServicesListing";
import ServiceDetail from "./pages/customer/ServiceDetail";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/services" element={<ServicesListing />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## Required peer deps
- `react`, `react-dom`, `react-router-dom`
- `lucide-react`
- `date-fns`

## Service types supported
Specialized cards: **Venue**, **Catering**, **Photography**.
Graceful generic card: **DJ**, **Makeup Artist**, **Event Management**.

The mock data in `customerMockData.js` includes one example for every service type so you can preview each layout immediately.

## Theming
All colors use HSL semantic tokens (`--brand`, `--gold`, `--muted`, `--foreground`, etc.).
If your project doesn't define them, copy `src/styles/theme.module.css` into your global stylesheet — or map the tokens to your own.
