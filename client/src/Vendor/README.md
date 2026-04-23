# Vendor Service Form — JSX + CSS Modules

Production-ready, modular React (JSX) implementation of the multi-step vendor service form with category-aware "i" tooltips on every field.

## What's inside
```
src/
  components/
    Common/
      InfoTooltip.jsx + .module.css   ← the "i" badge with smart-flip tooltip
      FieldLabel.jsx  + .module.css   ← Label + required + InfoTooltip in one
    vendor/
      ServiceFormModal.jsx + .module.css
      form/
        Stepper.jsx + .module.css
        TagInput.jsx + .module.css
        FormStep.module.css           ← shared step styles (inputs, grids, buttons)
        StepBasicInfo.jsx
        StepPricing.jsx
        StepSpecificDetails.jsx
        StepAmenitiesImages.jsx + .module.css
        StepReview.jsx + .module.css
  constants/
    serviceConstants.js               ← categories, pricing types, empty form
    fieldDescriptions.js              ← ALL tooltip texts, per service type
  hooks/
    useServiceForm.js                 ← form state + step nav + variants
```

## Theme
Uses your existing HSL CSS variables — no hardcoded colors:
`--brand`, `--background`, `--foreground`, `--muted`, `--muted-foreground`,
`--border`, `--card`, `--destructive`, `--success` (optional).

## How field tooltips work
1. Every field's `<FieldLabel>` accepts a `tooltip` prop.
2. The text is fetched from `getFieldDescription(fieldKey, formData.category)`.
3. `fieldDescriptions.js` has a per-category map (venue / catering / photography /
   dj / event_management / makeup_artist) — falling back to a `COMMON` map.
4. So the same "Description" / "Pricing Type" field shows DIFFERENT help text
   depending on the selected service category.

## Usage
```jsx
import ServiceFormModal from './components/vendor/ServiceFormModal';

<ServiceFormModal
  isOpen={open}
  onClose={() => setOpen(false)}
  initialData={editingService}        // null to create
  onSubmit={async (data) => { ... }}  // your API call
/>
```

## To add tooltip on a custom field
```jsx
import FieldLabel from './components/Common/FieldLabel';
import { getFieldDescription } from './constants/fieldDescriptions';

<FieldLabel tooltip={getFieldDescription('veg_price', formData.category)}>
  Veg price
</FieldLabel>
```
