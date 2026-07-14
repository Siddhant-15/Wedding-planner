import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/vendors",   label: "Vendors",   icon: "🏢" },
  { to: "/admin/services",  label: "Services",  icon: "🛠️" },
  { to: "/admin/bookings",  label: "Bookings",  icon: "📦" },
  { to: "/admin/reviews",   label: "Reviews",   icon: "⭐" },
  { to: "/admin/reports",   label: "Reports",   icon: "🚨" },
  { to: "/admin/featured",  label: "Featured",  icon: "🌟" },
  { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  { to: "/admin/settings",  label: "Settings",  icon: "⚙️" },
];

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse, onLogout }) {
  return (
    <>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${open ? styles.open : ""}`}
        aria-label="Admin sidebar"
      >
        <div className={styles.brand}>
          <div className={styles.logo}>A</div>
          {!collapsed && <div className={styles.brandText}>Admin Panel</div>}
        </div>

        <nav className={styles.nav}>
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.item} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon} aria-hidden>{it.icon}</span>
              {!collapsed && <span className={styles.label}>{it.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logout} onClick={onLogout}>
            <span className={styles.icon} aria-hidden>↩</span>
            {!collapsed && <span>Logout</span>}
          </button>
          <button className={styles.collapseBtn} onClick={onToggleCollapse} title="Collapse">
            {collapsed ? "›" : "‹"}
          </button>
        </div>
      </aside>
      {open && <div className={styles.backdrop} onClick={onClose} />}
    </>
  );
}
