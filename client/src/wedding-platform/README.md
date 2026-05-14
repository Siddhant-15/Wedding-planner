# Wedding/Service Marketplace — JSX + CSS Modules

React JSX (no TypeScript) + CSS Modules + Lucide React.

## Files
**Customer**
- `src/components/customer/GetQuoteModal.jsx` — Lead/availability modal (date check → form)
- `src/components/customer/RequestSuccess.jsx` — Success card with next steps
- `src/components/customer/RateExperience.jsx` — Post-event review form
- `src/pages/customer/ViewRequest.jsx` — Request lifecycle tracker with timeline

**Vendor**
- `src/pages/vendor/VendorLeads.jsx` — CRM-style leads dashboard with stats, filters, search
- `src/components/vendor/SubscriptionModal.jsx` — Premium upgrade modal
- `src/pages/vendor/VendorAvailability.jsx` — Calendar block/unblock manager

**Data**
- `src/data/mockData.js` — All static dummy data

## Usage
```jsx
import GetQuoteModal from "./components/customer/GetQuoteModal";
import { mockVendor } from "./data/mockData";

<GetQuoteModal open={open} onClose={...} vendor={mockVendor}
  onSuccess={(data) => navigate("/request/success")} />
```

## Theme
Uses existing CSS variables: `--brand`, `--brand-foreground`, `--background`,
`--foreground`, `--muted`, `--muted-foreground`, `--border`, `--card`, `--input`.

Drop the files into your project — no extra config required.
