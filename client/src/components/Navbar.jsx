import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User, ChevronDown, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import styles from "../styles/Navbar.module.css";
import logo from "@/assets/logo.png";
import { HiOutlineLogout } from "react-icons/hi";


const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Venues", href: "#venues" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact Us", href: "#contact" },
];

const VENDOR_NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "My Services", href: "/vendor/my-services" },
  { label: "Bookings", href: "/my-bookings" },
  { label: "Analytics", href: "/vendor/analytics" },
];

const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "Vendors", href: "/vendors" },
  { label: "Services", href: "/services" },
  { label: "Moderation", href: "/moderation" },
  { label: "Analytics", href: "/analytics" },
];

const SERVICE_LINKS = [
  { label: "Wedding Venues", href: "/services/wedding-venues" },
  { label: "DJs", href: "/services/djs" },
  { label: "Event Management", href: "/services/event-management" },
  { label: "Catering", href: "/services/catering" },
  { label: "Photography", href: "/services/photography" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const loginDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setLoginDropdownOpen(false);
        setProfileDropdownOpen(false);
        setServicesDropdownOpen(false);
        setSearchOpen(false);
      }
    };

    if (open || searchOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open, searchOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
      // Close search overlay when clicking outside
      const searchContainer = document.querySelector(`.${styles.searchContainer}`);
      if (searchOpen && searchContainer && !searchContainer.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen, servicesDropdownOpen]); // Added servicesDropdownOpen to dependencies

  const toggleLoginDropdown = () => {
    setLoginDropdownOpen(!loginDropdownOpen);
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false); // Close services dropdown when opening login
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    setLoginDropdownOpen(false);
    setServicesDropdownOpen(false); // Close services dropdown when opening profile
  };

  const toggleServicesDropdown = () => {
    setServicesDropdownOpen(!servicesDropdownOpen);
    setLoginDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  const closeAllDropdowns = () => {
    setLoginDropdownOpen(false);
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setSearchOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            aria-label="Open menu"
            aria-controls="mobile-primary-nav"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className={styles.brand} aria-label="Mangalam Home">
            <img src={logo} alt="Mangalam logo" className={styles.logo} />
            <span className={styles.brandText}>Mangalam</span>
          </Link>
        </div>

        {!isMobile && (
          <nav className={styles.navCenter} aria-label="Primary" aria-hidden={isMobile}
            hidden={isMobile}>
            {(() => {
              if (isAuthenticated && user) {
                switch (user.type) {
                  case "vendor":
                    return VENDOR_NAV_LINKS.map((l) => (
                      <Link key={l.label} to={l.href} className={styles.navLink}>
                        {l.label}
                      </Link>
                    ));
                  case "admin":
                    return ADMIN_NAV_LINKS.map((l) => (
                      <Link key={l.label} to={l.href} className={styles.navLink}>
                        {l.label}
                      </Link>
                    ));
                  case "customer":
                  default:
                    return (
                      <>
                        {NAV_LINKS.map((l) => (
                          <a key={l.label} href={l.href} className={styles.navLink}>
                            {l.label}
                          </a>
                        ))}
                        <div
                          ref={servicesDropdownRef}
                          className={styles.dropdown}
                        >
                          <button 
                            className={styles.navLink} 
                            onClick={toggleServicesDropdown}
                          >
                            Services <ChevronDown size={16} className={servicesDropdownOpen ? styles.chevronRotated : ''} />
                          </button>
                          {servicesDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                              {SERVICE_LINKS.map((service) => (
                                <Link
                                  key={service.label}
                                  to={service.href}
                                  className={styles.dropdownItem}
                                  onClick={() => setServicesDropdownOpen(false)}
                                >
                                  {service.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                }
              } else {
                return (
                  <>
                    {NAV_LINKS.map((l) => (
                      <a key={l.label} href={l.href} className={styles.navLink}>
                        {l.label}
                      </a>
                    ))}
                    <div
                      ref={servicesDropdownRef}
                      className={styles.dropdown}
                    >
                      <button 
                        className={styles.navLink}
                        onClick={toggleServicesDropdown}
                      >
                        Services <ChevronDown size={16} className={servicesDropdownOpen ? styles.chevronRotated : ''} />
                      </button>
                      {servicesDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                          {SERVICE_LINKS.map((service) => (
                            <Link
                              key={service.label}
                              to={service.href}
                              className={styles.dropdownItem}
                              onClick={() => setServicesDropdownOpen(false)}
                            >
                              {service.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              }
            })()}

            {!isAuthenticated && (
              <div
                ref={loginDropdownRef}
                className={styles.dropdown}
              >
                <button
                  className={`${styles.navLink} ${styles.dropdownToggle}`}
                  onClick={toggleLoginDropdown}
                >
                  Login/Register <ChevronDown size={16} className={loginDropdownOpen ? styles.chevronRotated : ''} />
                </button>
                {loginDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link to="/login?type=customer" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      Login/Register as Customer
                    </Link>
                    <Link to="/login?type=vendor" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      Login/Register as Vendor
                    </Link>
                    <Link to="/login?type=admin" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      Login as Admin
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        <div className={styles.right}>
          {isAuthenticated && (
            <>
              <button
                className={styles.iconBtn}
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={22} />
              </button>
              <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                <div className={styles.iconWrapper}>
                  <Heart size={22} />
                  {wishlistItems.length > 0 && (
                    <span className={styles.badge}>{wishlistItems.length}</span>
                  )}
                </div>
              </Link>
              <Link to="/cart" className={styles.iconBtn} aria-label="Shopping Cart">
                <div className={styles.iconWrapper}>
                  <ShoppingCart size={22} />
                  {getTotalItems() > 0 && (
                    <span className={styles.badge}>{getTotalItems()}</span>
                  )}
                </div>
              </Link>
              <div
                ref={profileDropdownRef}
                className={styles.dropdown}
              >
                <button
                  className={`${styles.iconBtn} ${styles.dropdownToggle}`}
                  aria-label="User Profile"
                  onClick={toggleProfileDropdown}
                >
                  <User size={22} />
                </button>
                {profileDropdownOpen && (
                  <div
                    className={styles.dropdownMenu}
                    style={{ right: 0, left: "auto" }}
                  >
                    <Link to="/my-bookings" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      My Bookings
                    </Link>
                    <Link to="/payments" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      Payments
                    </Link>
                    <Link to="/profile" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeAllDropdowns();
                      }}
                      className={styles.dropdownItem}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "red"
                      }}
                    >
                      <HiOutlineLogout /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <div
          className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >

          <div className={styles.drawerHeader}>
            <div className={styles.brandMini}>
              <img src={logo} alt="Mangalam logo" className={styles.logoMini} />
              <span className={styles.brandText}>Mangalam</span>
            </div>
            <button
              className={styles.closeBtn}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <nav id="mobile-primary-nav" className={styles.drawerNav} aria-label="Mobile">
            {(() => {
              if (isAuthenticated && user) {
                switch (user.type) {
                  case "vendor":
                    return VENDOR_NAV_LINKS.map((l) => (
                      <Link
                        key={l.label}
                        to={l.href}
                        className={styles.drawerLink}
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ));
                  case "admin":
                    return ADMIN_NAV_LINKS.map((l) => (
                      <Link
                        key={l.label}
                        to={l.href}
                        className={styles.drawerLink}
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ));
                  case "customer":
                  default:
                    return NAV_LINKS.map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        className={styles.drawerLink}
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </a>
                    ));
                }
              } else {
                return NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className={styles.drawerLink}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                ));
              }
            })()}
            {(!isAuthenticated || (isAuthenticated && user && user.type === "customer")) && (
              <div className={styles.drawerDropdown}>
                <span className={styles.drawerLinkTitle}>Services</span>
                {SERVICE_LINKS.map((service) => (
                  <Link
                    key={service.label}
                    to={service.href}
                    className={styles.drawerLink}
                    onClick={() => setOpen(false)}
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Wishlist and Cart Links */}
            {isAuthenticated && (
              <div className={styles.drawerDropdown}>
                <span className={styles.drawerLinkTitle}>Shopping</span>
                <Link
                  to="/wishlist"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Wishlist ({wishlistItems.length})
                </Link>
                <Link
                  to="/cart"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Cart ({getTotalItems()})
                </Link>
              </div>
            )}
            {!isAuthenticated ? (
              <div className={styles.drawerDropdown}>
                <span className={styles.drawerLinkTitle}>Login/Register</span>
                <Link
                  to="/login?type=customer"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Login/Register as Customer
                </Link>
                <Link
                  to="/login?type=vendor"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Login/Register as Vendor
                </Link>
                <Link
                  to="/login?type=admin"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Login/Register as Admin
                </Link>
              </div>
            ) : (
              <div className={styles.drawerDropdown}>
                <span className={styles.drawerLinkTitle}>Account</span>
                <Link
                  to="/my-bookings"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/payments"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Payments
                </Link>
                <Link
                  to="/profile"
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className={styles.drawerLink}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && (
        <div
          className={`${styles.backdrop} ${open ? styles.backdropShow : ""}`}
          onClick={() => setOpen(false)}
          aria-hidden={!open}
          hidden={!isMobile}
        />
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className={`${styles.searchOverlay} ${searchOpen ? styles.searchOverlayOpen : ""}`}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search venues, vendors, services..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              className={styles.searchClose}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;