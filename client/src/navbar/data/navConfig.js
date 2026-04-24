import {
  Building2,
  Camera,
  UtensilsCrossed,
  Music,
  Sparkles,
  Brush,
  Calendar,
  CreditCard,
  Settings,
  Wrench,
  BarChart3,
  User,
} from "lucide-react";

export const PUBLIC_NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Venues", to: "/services/venue" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const VENDOR_NAV_LINKS = [
  { label: "Dashboard", to: "/" },
  { label: "My Services", to: "/vendor/my-services" },
  { label: "Bookings", to: "/my-bookings" },
  { label: "Analytics", to: "/vendor/analytics" },
];

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", to: "/" },
  { label: "Vendors", to: "/vendors" },
  { label: "Services", to: "/services" },
  { label: "Moderation", to: "/moderation" },
  { label: "Analytics", to: "/analytics" },
];

export const SERVICE_LINKS = [
  {
    label: "Venues",
    to: "/services/venue",
    desc: "Banquet halls, lawns & resorts",
    icon: Building2,
  },
  {
    label: "Photography",
    to: "/services/photography",
    desc: "Capture every precious moment",
    icon: Camera,
  },
  {
    label: "Catering",
    to: "/services/catering",
    desc: "Multi-cuisine wedding feasts",
    icon: UtensilsCrossed,
  },
  {
    label: "DJs & Music",
    to: "/services/dj",
    desc: "Live bands & sound systems",
    icon: Music,
  },
  {
    label: "Event Management",
    to: "/services/event_management",
    desc: "End-to-end planning",
    icon: Sparkles,
  },
  {
    label: "Makeup Artists",
    to: "/services/makeup_artist",
    desc: "Bridal & party looks",
    icon: Brush,
  },
];

export const AUTH_LINKS = [
  { label: "Sign in as Customer", to: "/login", desc: "Plan your dream wedding" },
  { label: "Sign in as Vendor", to: "/login", desc: "Grow your business with us" },
  { label: "Sign in as Admin", to: "/login", desc: "Platform administration" },
];

export const ACCOUNT_LINKS = [
  {
    label: "My Account",
    to: "/my-account",
    icon: User,
    desc: "View account details",
  },
  {
    label: "Bookings",
    to: "/booking",
    icon: Calendar,
    desc: "Track your bookings",
  },
  {
    label: "Payments",
    to: "/payment",
    icon: CreditCard,
    desc: "Manage payments",
  },
  {
    label: "Profile Settings",
    to: "/profile-settings",
    icon: Settings,
    desc: "Update your profile",
  },
];

export const VENDOR_ACCOUNT_EXTRA = [
  { label: "My Services", to: "/vendor/my-services", icon: Wrench },
  { label: "Analytics", to: "/vendor/analytics", icon: BarChart3 },
];

export function getNavLinksForUser(isAuthenticated, user) {
  if (!isAuthenticated || !user) return PUBLIC_NAV_LINKS;
  if (user.type === "vendor") return VENDOR_NAV_LINKS;
  if (user.type === "admin") return ADMIN_NAV_LINKS;
  return PUBLIC_NAV_LINKS;
}