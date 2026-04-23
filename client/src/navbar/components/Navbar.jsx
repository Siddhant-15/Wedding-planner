import React, { useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Heart, LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

import Brand from "./Brand";
import IconButton from "./IconButton";
import Dropdown from "./Dropdown";
import MobileDrawer from "./MobileDrawer";

import {
  SERVICE_LINKS,
  AUTH_LINKS,
  ACCOUNT_LINKS,
  VENDOR_ACCOUNT_EXTRA,
  getNavLinksForUser,
} from "../data/navConfig";

import { useScrolled, useIsMobile } from "../hooks/useNavbarBehavior";
import styles from "../styles/Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const scrolled = useScrolled(8);
  const isMobile = useIsMobile(1024);

  const { isAuthenticated, user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length || 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const mainLinks = getNavLinksForUser(isAuthenticated, user);
  const isCustomerView = !isAuthenticated || user?.type === "customer";
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  const handleLogout = useCallback(() => {
    logout?.();
    setProfileOpen(false);
    navigate("/");
  }, [logout, navigate]);

  const profileItems = [
    {
      label: user?.name || "My Account",
      desc: user?.email || user?.type,
      icon: <span className={styles.avatarSmall}>{initial}</span>,
    },
    { divider: true },

    ...ACCOUNT_LINKS.map((a) => ({
      label: a.label,
      desc: a.desc,
      to: a.to,
      icon: a.icon,
    })),

    ...(user?.type === "vendor"
      ? [
        { divider: true },
        ...VENDOR_ACCOUNT_EXTRA.map((a) => ({
          label: a.label,
          to: a.to,
          icon: a.icon,
        })),
      ]
      : []),

    { divider: true },

    {
      label: "Logout",
      icon: LogOut,
      desc: "Logout from your account",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <div className={styles.navbarSpacer} aria-hidden="true" />
      {/* HEADER */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* LEFT */}
          <div className={styles.left}>
            <Brand />
          </div>

          {/* CENTER */}
          {!isMobile && (
            <nav className={styles.center}>
              {mainLinks.map((l) => (
                <NavLink
                  key={l.to + l.label}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              {isCustomerView && (
                <Dropdown
                  label="Services"
                  open={servicesOpen}
                  onOpenChange={(v) => {
                    setServicesOpen(v);
                    if (v) {
                      setAuthOpen(false);
                      setProfileOpen(false);
                    }
                  }}
                  items={SERVICE_LINKS.map((s) => ({
                    label: s.label,
                    desc: s.desc,
                    icon: s.icon,
                    to: s.to,
                  }))}
                />
              )}
            </nav>
          )}

          {/* RIGHT */}
          <div className={styles.right}>
            {/* MOBILE */}
            {isMobile && (
              <>
                {isAuthenticated && user?.type === "customer" && (
                  <IconButton
                    ariaLabel="Wishlist"
                    onClick={() => navigate("/wishlist")}
                    badge={wishlistCount}
                  >
                    <Heart size={20} />
                  </IconButton>
                )}

                <button
                  className={styles.menuBtn}
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu size={20} />
                </button>
              </>
            )}

            {/* DESKTOP */}
            {!isMobile && (
              <>
                {isAuthenticated && user?.type === "customer" && (
                  <IconButton
                    ariaLabel="Wishlist"
                    onClick={() => navigate("/wishlist")}
                    badge={wishlistCount}
                  >
                    <Heart size={20} />
                  </IconButton>
                )}

                {!isAuthenticated ? (
                  <>
                    <Dropdown
                      label="Sign in"
                      open={authOpen}
                      onOpenChange={(v) => {
                        setAuthOpen(v);
                        if (v) {
                          setServicesOpen(false);
                          setProfileOpen(false);
                        }
                      }}
                      align="right"
                      items={AUTH_LINKS.map((a) => ({
                        label: a.label,
                        desc: a.desc,
                        to: a.to,
                      }))}
                    />

                    <Link to="/become-vendor" className={styles.cta}>
                      <Sparkles size={14} />
                      Become a Vendor
                    </Link>
                  </>
                ) : (
                  <Dropdown
                    open={profileOpen}
                    onOpenChange={(v) => {
                      setProfileOpen(v);
                      if (v) {
                        setServicesOpen(false);
                        setAuthOpen(false);
                      }
                    }}
                    align="right"
                    items={profileItems}
                    triggerContent={
                      <span className={styles.avatarTrigger}>
                        <span className={styles.avatar}>{initial}</span>
                        <span className={styles.avatarName}>
                          {user?.name || "Account"}
                        </span>
                      </span>
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        wishlistCount={wishlistCount}
      />
    </>
  );
}

export default Navbar;