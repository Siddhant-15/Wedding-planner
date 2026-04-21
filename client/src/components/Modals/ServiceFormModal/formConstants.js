// src/components/services/ServiceFormModal/formConstants.js

export const serviceTypes = [
    { value: "venue", label: "Venue" },
    { value: "dj", label: "DJ" },
    { value: "event_management", label: "Event Management" },
    { value: "catering", label: "Catering" },
    { value: "photography", label: "Photography" },
    { value: "makeup_artist", label: "Makeup Artist" },
];

export const pricingTypes = [
    { value: "per_day", label: "Per Day" },
    { value: "per_hour", label: "Per Hour" },
    { value: "per_head", label: "Per Head" },
    { value: "package", label: "Package" },
];

export const hallTypes = [
    { value: "banquet", label: "Banquet" },
    { value: "lawn", label: "Lawn" },
    { value: "farmhouse", label: "Farmhouse" },
    { value: "resort", label: "Resort" },
];

export const indoorOutdoorOptions = [
    { value: "indoor", label: "Indoor" },
    { value: "outdoor", label: "Outdoor" },
    { value: "both", label: "Both" },
];

export const policyOptions = [
    { value: "allowed", label: "Allowed" },
    { value: "in-house-only", label: "In-House Only" },
];

export const alcoholOptions = [
    { value: "allowed", label: "Allowed" },
    { value: "not-allowed", label: "Not Allowed" },
];

export const serviceStyles = [
    { value: "buffet", label: "Buffet" },
    { value: "plated", label: "Plated" },
    { value: "live_counter", label: "Live Counter" },
];

export const packageModals = [
    { value: "package_based", label: "Package Based" },
    { value: "hourly", label: "Hourly" },
    { value: "fixed", label: "Fixed" },
];

export const steps = [
    "Basic Info",
    "Service Type & Pricing",
    "Specific Details",
    "Amenities & Images",
    "Review & Publish"
];