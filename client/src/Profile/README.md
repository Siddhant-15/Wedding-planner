# Account Pages — Mangalam Wedding Platform

Four professional, fully responsive account pages built with **JSX + CSS Modules**.
Premium Wedding theme (rose + gold) — uses your existing HSL design tokens (`--brand`, `--gold`, `--font-heading`).
**No gradients** — solid brand colors only. **Lucide React icons** throughout.

## 📁 File Structure

```
src/
├── pages/
│   ├── MyBookings.jsx          # Booking list w/ filters, search, stats
│   ├── Payments.jsx            # Transaction table + payment methods
│   ├── MyAccount.jsx           # Profile overview + quick stats
│   └── ProfileSettings.jsx     # Tabbed settings (Personal/Security/Notifications/Privacy)
│
├── components/
│   ├── PageShell.jsx           # Shared layout: breadcrumb, header, sidebar slot
│   ├── SideNav.jsx             # Account sidebar nav (becomes horizontal tabs on mobile)
│   └── EmptyState.jsx          # Reusable empty state
│
├── styles/
│   ├── MyBookings.module.css
│   ├── Payments.module.css
│   ├── MyAccount.module.css
│   ├── ProfileSettings.module.css
│   ├── PageShell.module.css
│   ├── SideNav.module.css
│   └── EmptyState.module.css
│
└── data/
    └── mockData.js             # Mock bookings, payments, user — replace with API
```

## ✨ Features

### `MyBookings.jsx`
- 4 KPI stat cards (total, upcoming, completed, total spent)
- Status filter tabs with counts (All / Confirmed / Pending / Completed / Cancelled)
- Search + sort (recent / upcoming / amount)
- Rich booking cards: image, vendor, date/time/location/guests, price, actions
- Empty state, status badges, hover animations
- **Mobile**: card image stacks above content, full-width action buttons

### `Payments.jsx`
- 3 summary cards (total spent, refunded, transactions)
- **Payment methods grid**: cards/UPI with primary tag, set-as-primary, delete
- Transaction filter pills (All / Successful / Refunds / Failed)
- **Desktop**: clean data table with status pills, invoice download
- **Mobile**: auto-switches to card view (no horizontal scrolling)
- Refunds shown in success-green with `−` sign

### `MyAccount.jsx`
- Hero card: avatar (initials fallback) + edit button, name, verified badge, contact info
- 4 quick-stat cards with deep-links
- Two-column: Personal Info list + Upcoming Events (with date-block design)
- Soft brand glow accent in hero (no gradient — single blurred color blob)

### `ProfileSettings.jsx`
- 4 tabbed sections: **Personal** / **Security** / **Notifications** / **Privacy**
- Personal: avatar uploader, 2-col responsive form grid, all standard inputs
- Security: password fields with show/hide, 2FA toggle, **Danger Zone** delete account
- Notifications: 4 toggle switches (custom-styled, brand-colored)
- Privacy: profile visibility toggles + data download
- Save flash banner appears on submit (auto-dismisses 2.2s)

## 🔌 Integration

1. **Copy folders** into your `src/`:
   ```
   src/pages/        → your routes
   src/components/   → shared (or merge with existing)
   src/styles/       → CSS modules
   src/data/         → mock data (replace with API later)
   ```

2. **Wire up routes** (TanStack Router example):
   ```tsx
   // src/routes/my-bookings.tsx
   import { createFileRoute } from "@tanstack/react-router";
   import MyBookings from "../pages/MyBookings";
   export const Route = createFileRoute("/my-bookings")({ component: MyBookings });
   ```

3. **Replace `<a href>`** with your router's `<Link>` component in `SideNav.jsx`,
   `MyAccount.jsx`, and any other navigation spots.

4. **Replace mock data** in `data/mockData.js` with your real API/Context calls.
   Each page imports cleanly — swap `MOCK_BOOKINGS` for `useBookings()` etc.

5. **Connect logout** in `SideNav` by passing `onLogout={logout}` from `useAuth()`.

## 🎨 Design Tokens Used

All styles consume your existing `src/styles.css` tokens:
- `--brand`, `--brand-foreground` — primary rose
- `--background`, `--foreground`, `--muted`, `--muted-foreground`
- `--border`, `--success`, `--warning`, `--destructive`
- `--font-heading` (Playfair Display) for titles & numbers

**Zero hard-coded colors.** Dark mode works out of the box.

## 📱 Responsive Breakpoints

- **≥ 1024px** — full sidebar layout, 4-col stats, table view
- **720–1024px** — sidebar collapses to horizontal tabs, 2-col stats
- **< 720px** — single column, table → cards, stacked actions
- **< 480px** — compact paddings, stat cards 1-column

Tested with:
- Touch-friendly tap targets (min 38px)
- Horizontal scroll prevention on toolbars
- Sticky sidebar on desktop, scrollable tabs on mobile
- `prefers-reduced-motion` friendly (transitions are short)

## 🧩 Reuse Notes

- `PageShell` is the consistency anchor — every account page uses it
- `SideNav` is one source of truth for account navigation
- `EmptyState` is reused across MyBookings + Payments
- All form inputs share the same `.input` style for visual consistency
