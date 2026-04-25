# Admin Panel — Service Booking Platform

Production-ready React + CSS Modules admin dashboard. **No Tailwind. No UI libs.**

## Folder structure
```
src/
├── pages/admin/
│   ├── AdminLogin.jsx + .module.css
│   ├── Dashboard.jsx + .module.css
│   ├── Vendors.jsx + .module.css
│   ├── Services.jsx + .module.css
│   ├── Bookings.jsx + .module.css
│   ├── Reviews.jsx + .module.css
│   ├── Reports.jsx + .module.css
│   ├── Featured.jsx + .module.css
│   ├── Analytics.jsx + .module.css
│   └── Settings.jsx + .module.css
├── components/admin/
│   ├── layout/ (AdminLayout, Sidebar, Topbar, ProtectedAdminRoute)
│   └── ui/ (Table, Card, Modal, StatusBadge, Loader, Empty, ConfirmDialog, SearchInput)
├── context/AdminAuthContext.jsx
├── services/adminApi.js          ← mock API; flip USE_MOCK=false to wire backend
├── utils/format.js
└── styles/admin-theme.css        ← global CSS variables (colors, radius, shadows)
```

## Routing (add to your router)
```jsx
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/layout/ProtectedAdminRoute";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
// ...other pages

<AdminAuthProvider>
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/vendors" element={<Vendors />} />
      <Route path="/admin/services" element={<Services />} />
      <Route path="/admin/bookings" element={<Bookings />} />
      <Route path="/admin/reviews" element={<Reviews />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/featured" element={<Featured />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/settings" element={<Settings />} />
    </Route>
  </Routes>
</AdminAuthProvider>
```

## Demo login (mock mode)
- Email: `admin@platform.com`
- Password: `admin123`

## Wire to real backend
In `src/services/adminApi.js` set `USE_MOCK = false` and adjust `BASE_URL`. All endpoints are documented in that file.

## Theme
Import `src/styles/admin-theme.css` once at app entry (e.g. `main.jsx`).
