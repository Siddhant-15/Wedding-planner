# Mangalam Navbar — Premium Modular Build

A production-grade, fully responsive navbar split into small, single-responsibility
components. Drop the `navbar/` folder into your `src/components/` (rename as you like)
and import `Navbar` from `components/Navbar.jsx`.

## File map

```
navbar/
├── components/
│   ├── Navbar.jsx          ← main composer (use this)
│   ├── Brand.jsx           ← logo + wordmark
│   ├── Dropdown.jsx        ← reusable desktop dropdown (Services / Sign in / Profile)
│   ├── IconButton.jsx      ← square icon btn with optional badge
│   ├── SearchBar.jsx       ← InlineSearch + SearchOverlay
│   └── MobileDrawer.jsx    ← right-side slide-in drawer
├── styles/
│   ├── Navbar.module.css
│   ├── Brand.module.css
│   ├── Dropdown.module.css
│   ├── IconButton.module.css
│   ├── SearchBar.module.css
│   └── MobileDrawer.module.css
├── hooks/
│   └── useNavbarBehavior.js   ← useIsMobile, useScrolled, useEscapeKey,
│                                useBodyScrollLock, useClickOutside
└── data/
    └── navConfig.js           ← all link arrays in one place
```

## Why it's better than the original

- **Modular** — every concern is its own file (~80–150 LOC each instead of one 600-line component).
- **Reusable hooks** — scroll, escape, click-outside, body-lock, breakpoint detection.
- **Centralized config** — links live in `data/navConfig.js`, not buried in JSX.
- **Premium visuals** — gradient brand wordmark, gold/rose CTA, glassy header, animated underlines, gradient avatars, shadow on scroll.
- **A11y** — `aria-expanded`, `aria-haspopup`, `aria-modal`, `role="dialog"`, focus on search open, ESC to close, keyboard-friendly.
- **Responsive** — true mobile drawer (right-side, full-height, body lock), backdrop, hamburger swap at 1024px.
- **Role-aware** — public / customer / vendor / admin nav from one helper.
- **Type-safe paths** — single source of truth in `navConfig.js`.

## Required deps (already in your project)

- `react-router-dom`
- `lucide-react`
- `@/context/AuthContext` exposing `{ isAuthenticated, user, logout }`
- `@/context/WishlistContext` exposing `{ items }`
- `@/assets/logo.png`

## Design tokens used

Reuses your existing `index.css` HSL tokens:
`--background`, `--foreground`, `--border`, `--muted`, `--muted-foreground`,
`--brand`, `--brand-foreground`, `--gold`, `--destructive`, `--font-heading`.

No new tokens required — it slots into your current design system.

## Usage

```jsx
import Navbar from "@/components/navbar/components/Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

## Customization quick wins

- **Add/remove links** → edit `data/navConfig.js`.
- **Change CTA destination** → `Navbar.jsx` line with `to="/become-vendor"`.
- **Swap drawer side** → in `MobileDrawer.module.css`, change `right: 0` → `left: 0` and `translateX(100%)` → `translateX(-100%)`.
- **Tighter dropdown** → adjust `min-width` in `Dropdown.module.css`.
