import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown, Search, Heart, LogOut, Sparkles } from "lucide-react";
import IconButton from "./IconButton";
import Brand from "./Brand";
import {
  SERVICE_LINKS,
  AUTH_LINKS,
  ACCOUNT_LINKS,
  VENDOR_ACCOUNT_EXTRA,
  getNavLinksForUser,
} from "../data/navConfig";
import { useEscapeKey, useBodyScrollLock } from "../hooks/useNavbarBehavior";
import styles from "../styles/MobileDrawer.module.css";

function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.collapsible}>
      <button
        type="button"
        className={styles.collapsibleHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown size={18} className={`${styles.chev} ${open ? styles.chevOpen : ""}`} />
      </button>
      <div className={`${styles.collapsibleBody} ${open ? styles.open : ""}`}>{children}</div>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  isAuthenticated,
  user,
  onLogout,
  wishlistCount = 0,
  onOpenSearch,
}) {
  useEscapeKey(onClose, open);
  useBodyScrollLock(open);

  const mainLinks = getNavLinksForUser(isAuthenticated, user);
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const showCustomerExtras = !isAuthenticated || user?.type === "customer";

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.header}>
          <Brand />
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initial}</div>
            <div>
              <p className={styles.userName}>Hi, {user.name || "Friend"}</p>
              <p className={styles.userType}>{user.type || "customer"} account</p>
            </div>
          </div>
        )}

        <div className={styles.searchRow}>
          <button
            type="button"
            className={styles.link}
            style={{
              padding: "0.7rem 0.9rem",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
            }}
            onClick={() => {
              onClose();
              onOpenSearch?.();
            }}
          >
            <Search size={18} />
            <span>Search venues, vendors…</span>
          </button>
        </div>

        <nav className={styles.body}>
          <p className={styles.sectionTitle}>Browse</p>
          {mainLinks.map((l) => (
            <Link key={l.to + l.label} to={l.to} className={styles.link} onClick={onClose}>
              {l.label}
            </Link>
          ))}

          {/* ✅ SERVICES */}
          {showCustomerExtras && (
            <Section title="Services">
              {SERVICE_LINKS.map((s) => {
                const Icon = s.icon; // 👈 FIX

                return (
                  <Link key={s.to} to={s.to} className={styles.subLink} onClick={onClose}>
                    <span className={styles.subLinkIcon}>
                      {Icon && <Icon size={16} />} {/* ✅ FIX */}
                    </span>
                    {s.label}
                  </Link>
                );
              })}
            </Section>
          )}

          {/* ✅ ACCOUNT */}
          {isAuthenticated && (
            <Section title="My Account" defaultOpen>
              {ACCOUNT_LINKS.map((a) => {
                const Icon = a.icon;

                return (
                  <Link key={a.to} to={a.to} className={styles.subLink} onClick={onClose}>
                    <span className={styles.subLinkIcon}>
                      {Icon && <Icon size={16} />} {/* ✅ FIX */}
                    </span>
                    {a.label}
                  </Link>
                );
              })}

              {user?.type === "vendor" &&
                VENDOR_ACCOUNT_EXTRA.map((a) => {
                  const Icon = a.icon;

                  return (
                    <Link key={a.to} to={a.to} className={styles.subLink} onClick={onClose}>
                      <span className={styles.subLinkIcon}>
                        {Icon && <Icon size={16} />} {/* ✅ FIX */}
                      </span>
                      {a.label}
                    </Link>
                  );
                })}

              {user?.type === "customer" && (
                <Link to="/wishlist" className={styles.subLink} onClick={onClose}>
                  <span className={styles.subLinkIcon}>
                    <Heart size={16} />
                  </span>
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              )}
            </Section>
          )}

          {!isAuthenticated && (
            <Section title="Sign in / Register">
              {AUTH_LINKS.map((a) => (
                <Link key={a.to} to={a.to} className={styles.subLink} onClick={onClose}>
                  {a.label}
                </Link>
              ))}
            </Section>
          )}
        </nav>

        <div className={styles.footer}>
          {(!isAuthenticated || user?.type === "customer") && (
            <Link to="/become-vendor" className={styles.cta} onClick={onClose}>
              <Sparkles size={16} />
              Become a Vendor
            </Link>
          )}
          {isAuthenticated && (
            <button
              type="button"
              className={styles.logout}
              onClick={() => {
                onLogout?.();
                onClose();
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default MobileDrawer;