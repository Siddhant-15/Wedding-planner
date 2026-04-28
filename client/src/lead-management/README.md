# Lead Management — Drop-in Module

Plug-and-play React components for the customer + vendor lead flow.
Uses your existing theme tokens (`--primary`, `--foreground`, `--muted`, `--border`, `--destructive`, `--card`, `--font-heading`, `--font-body`). No new colors introduced.

## File Map

```
/components
  LeadForm.jsx           ← Multi-step customer lead form (3 steps + success state)
  LeadForm.module.css
  LeadStatus.jsx         ← Real-time status tracker + fallback banner
  LeadStatus.module.css
  FeedbackModal.jsx      ← Post-event feedback modal with conditional review
  FeedbackModal.module.css

/pages
  VendorLeads.jsx        ← Vendor dashboard: cards, filters, actions, status
  VendorLeads.module.css
```

## Usage

### Customer-side

```jsx
import LeadForm from "@/components/LeadForm";
import LeadStatus from "@/components/LeadStatus";
import FeedbackModal from "@/components/FeedbackModal";

<LeadForm
  vendorName="Royal Banquets"
  expectedResponseTime="2 hours"
  onSubmit={(payload) => console.log(payload)}
/>

<LeadStatus status="seen" fallback={false} vendorName="Royal Banquets" />
{/* status: "sent" | "seen" | "responded" */}
{/* fallback: true → shows "connecting you with more vendors" banner */}

<FeedbackModal
  isOpen={open}
  vendorName="Royal Banquets"
  onClose={() => setOpen(false)}
  onSubmit={(data) => console.log(data)}
/>
```

### Vendor-side

```jsx
import VendorLeads from "@/pages/VendorLeads";

<VendorLeads />
```

## Notes
- All state is local (`useState`) — wire to your API in the `onSubmit` / `onUpdate` handlers.
- Phone validation uses Indian 10-digit pattern (replace if needed).
- Mock data lives at the top of `VendorLeads.jsx` — swap for your fetch/loader.
- Fully responsive: desktop grid → mobile single-column stack.
- Icons via `lucide-react` (already used elsewhere in the project).
