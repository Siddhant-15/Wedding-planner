import React from "react";
import { Calendar, CreditCard, User, Settings, Heart, LogOut } from "lucide-react";
import styles from "../styles/SideNav.module.css";

/**
 * Reusable sidebar nav for account pages.
 * Pass `active` = "bookings" | "payments" | "account" | "settings".
 * Replace `<a>` with router Link in your app.
 */
const NAV_ITEMS = [
  { key: "bookings", label: "My Bookings", href: "/my-bookings", icon: Calendar },
  { key: "payments", label: "Payments", href: "/payments", icon: CreditCard },
  { key: "account", label: "My Account", href: "/account", icon: User },
  { key: "settings", label: "Profile Settings", href: "/profile-settings", icon: Settings },
  { key: "wishlist", label: "Wishlist", href: "/wishlist", icon: Heart },
];

function SideNav({ active, onLogout }) {
  return (
    <nav className={styles.nav} aria-label="Account navigation">
      <div className={styles.navHeader}>
        <span className={styles.navTitle}>Account</span>
      </div>

      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <a
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {onLogout && (
        <>
          <div className={styles.divider} />
          <button type="button" onClick={onLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </>
      )}
    </nav>
  );
}

export default SideNav;
