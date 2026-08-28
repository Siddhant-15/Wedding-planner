import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  BarChart3,
  Star,
  UserCircle,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import styles from "../../styles/VendorSidebar.module.css";

// Primary vendor navigation. Keep this the single source of truth for
// vendor IA — VendorNavbar's inline links should eventually be retired
// or kept in sync with this list to avoid two divergent nav sources.
const NAV_ITEMS = [
  // NOTE: /vendor/dashboard currently renders the Services list (via
  // VendorPage.jsx), not a true Overview page yet. Labeling it
  // "Overview" here reflects the target IA; swap the route once the
  // real Overview page exists.
  { label: "Overview", to: "/vendor/dashboard", icon: LayoutDashboard, end: true },
  { label: "Leads", to: "/vendor/leads", icon: Inbox },
  { label: "Services", to: "/vendor/services", icon: Briefcase },
  { label: "Analytics", to: "/vendor/analytics", icon: BarChart3 },
  { label: "Reviews", to: "/vendor/reviews", icon: Star },
  { label: "Profile", to: "/vendor/profile", icon: UserCircle },
];

const SETTINGS_ITEM = { label: "Settings", to: "/vendor/settings", icon: SettingsIcon };

export default function VendorSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("vendor_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vendor_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {
      // ignore storage errors (e.g. private browsing / disabled storage)
    }
  }, [collapsed]);

  const renderLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
        }
        title={item.label}
      >
        <Icon size={18} className={styles.navIcon} aria-hidden="true" />
        <span className={styles.navLabel}>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop / tablet vertical sidebar */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
        aria-label="Vendor navigation"
      >
        <nav className={styles.nav}>{NAV_ITEMS.map(renderLink)}</nav>

        <div className={styles.sidebarFooter}>
          {renderLink(SETTINGS_ITEM)}

          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            {collapsed ? (
              <ChevronsRight size={16} aria-hidden="true" />
            ) : (
              <ChevronsLeft size={16} aria-hidden="true" />
            )}
            <span className={styles.navLabel}>Collapse</span>
          </button>
        </div>
      </aside>

      {/* Mobile: horizontal scrollable nav, sits under the fixed navbar */}
      <nav className={styles.mobileNav} aria-label="Vendor navigation">
        <div className={styles.mobileNavScroll}>
          {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.mobileChip} ${isActive ? styles.mobileChipActive : ""}`
                }
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}