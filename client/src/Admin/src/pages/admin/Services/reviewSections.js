// Single source of truth for section order/labels on the frontend.
// Mirrors backend ALL_SECTIONS -- if the backend ever excludes a section
// for a given service type, the GET /review response's `sections` array
// is still what drives the sidebar (this list is just labels/order).

export const REVIEW_SECTIONS = [
  { key: "basic_information", label: "Basic Info" },
  { key: "location", label: "Location" },
  { key: "media", label: "Media" },
  { key: "pricing_variants", label: "Pricing" },
  { key: "service_details", label: "Details" },
  { key: "policies_metadata", label: "Policies" },
];

export function sectionIcon(status) {
  if (status === "approved") return "✓";
  if (status === "changes_requested") return "!";
  return "○";
}

export function sectionLabel(key) {
  return REVIEW_SECTIONS.find((s) => s.key === key)?.label || key;
}
