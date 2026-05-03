// Mock notifications data — replace with API later
export const NOTIFICATION_TYPES = {
  lead: { label: "New Lead", color: "brand", icon: "Sparkles" },
  response: { label: "Vendor Responded", color: "success", icon: "MessageSquare" },
  reminder: { label: "Reminder", color: "warning", icon: "Bell" },
  fallback: { label: "Fallback Triggered", color: "destructive", icon: "AlertTriangle" },
  feedback: { label: "Feedback Request", color: "gold", icon: "Star" },
};

export const mockNotifications = [
  {
    id: 1,
    title: "New Lead Received",
    message: "Wedding event on 25 May — 200 guests in Mumbai.",
    type: "lead",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: "/vendor/bookings",
  },
  {
    id: 2,
    title: "Vendor Responded",
    message: "Royal Palace replied to your inquiry.",
    type: "response",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: "/customer/inbox",
  },
  {
    id: 3,
    title: "Booking Reminder",
    message: "Your event is in 3 days. Confirm final headcount.",
    type: "reminder",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: "/customer/bookings",
  },
  {
    id: 4,
    title: "Feedback Request",
    message: "How was your experience with Bliss Caterers?",
    type: "feedback",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    link: "/customer/reviews",
  },
  {
    id: 5,
    title: "Fallback Triggered",
    message: "Primary vendor unavailable — alternates suggested.",
    type: "fallback",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    link: "/customer/bookings",
  },
  {
    id: 6,
    title: "New Lead Received",
    message: "Corporate event on 10 June — Bengaluru.",
    type: "lead",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: "/vendor/bookings",
  },
];

// Time-ago helper
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function isToday(iso) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}
