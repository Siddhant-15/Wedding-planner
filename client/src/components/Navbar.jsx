import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User, ChevronDown, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
  { label: "Venues", href: "/services/wedding-venues" },
  { label: "DJs", href: "/services/djs" },
  { label: "Event Management", href: "/services/event-management" },
  { label: "Catering", href: "/services/catering" },
  { label: "Photography", href: "/services/photography" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Desktop dropdowns
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Mobile collapsible sections
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false);
  const [authMobileOpen, setAuthMobileOpen] = useState(false);
  const [accountMobileOpen, setAccountMobileOpen] = useState(true);
  const [shoppingMobileOpen, setShoppingMobileOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();

  // Refs
  const servicesRef = useRef(null);
  const loginRef = useRef(null);
  const profileRef = useRef(null);
  const servicesMobileRef = useRef(null);
  const authMobileRef = useRef(null);
  const accountMobileRef = useRef(null);
  const shoppingMobileRef = useRef(null);

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
        setSearchOpen(false);
        closeAllDropdowns();
      }
    };
    if (open || searchOpen) window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open, searchOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesDropdownOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (open) {
        if (servicesMobileRef.current && !servicesMobileRef.current.contains(event.target)) {
          setServicesMobileOpen(false);
        }
        if (authMobileRef.current && !authMobileRef.current.contains(event.target)) {
          setAuthMobileOpen(false);
        }
        if (accountMobileRef.current && !accountMobileRef.current.contains(event.target)) {
          setAccountMobileOpen(false);
        }
        if (shoppingMobileRef.current && !shoppingMobileRef.current.contains(event.target)) {
          setShoppingMobileOpen(false);
        }
      }
      const searchEl = document.querySelector(`.${styles.searchContainer}`);
      if (searchOpen && searchEl && !searchEl.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, searchOpen]);

  const closeAllDropdowns = () => {
    setServicesDropdownOpen(false);
    setLoginDropdownOpen(false);
    setProfileDropdownOpen(false);
    setServicesMobileOpen(false);
    setAuthMobileOpen(false);
    setAccountMobileOpen(false);
    setShoppingMobileOpen(false);
  };

  const toggleServices = () => {
    const willOpen = !servicesDropdownOpen;
    setServicesDropdownOpen(willOpen);
    if (willOpen) closeAllDropdownsExcept("services");
  };

  const toggleLogin = () => {
    const willOpen = !loginDropdownOpen;
    setLoginDropdownOpen(willOpen);
    if (willOpen) closeAllDropdownsExcept("login");
  };

  const toggleProfile = () => {
    const willOpen = !profileDropdownOpen;
    setProfileDropdownOpen(willOpen);
    if (willOpen) closeAllDropdownsExcept("profile");
  };

  const toggleServicesMobile = () => {
    const willOpen = !servicesMobileOpen;
    setServicesMobileOpen(willOpen);
    if (willOpen) closeAllMobileExcept("services");
  };

  const toggleAuthMobile = () => {
    const willOpen = !authMobileOpen;
    setAuthMobileOpen(willOpen);
    if (willOpen) closeAllMobileExcept("auth");
  };

  const toggleAccountMobile = () => {
    const willOpen = !accountMobileOpen;
    setAccountMobileOpen(willOpen);
    if (willOpen) closeAllMobileExcept("account");
  };

  const toggleShoppingMobile = () => {
    const willOpen = !shoppingMobileOpen;
    setShoppingMobileOpen(willOpen);
    if (willOpen) closeAllMobileExcept("shopping");
  };

  const closeAllDropdownsExcept = (current) => {
    if (current !== "services") setServicesDropdownOpen(false);
    if (current !== "login") setLoginDropdownOpen(false);
    if (current !== "profile") setProfileDropdownOpen(false);
  };

  const closeAllMobileExcept = (current) => {
    if (current !== "services") setServicesMobileOpen(false);
    if (current !== "auth") setAuthMobileOpen(false);
    if (current !== "account") setAccountMobileOpen(false);
    if (current !== "shopping") setShoppingMobileOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            aria-label="Open menu"
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

        {/* Desktop Nav */}
        {!isMobile && (
          <nav className={styles.navCenter}>
            {isAuthenticated && user ? (
              user.type === "vendor" ? (
                VENDOR_NAV_LINKS.map((l) => (
                  <Link key={l.label} to={l.href} className={styles.navLink}>
                    {l.label}
                  </Link>
                ))
              ) : user.type === "admin" ? (
                ADMIN_NAV_LINKS.map((l) => (
                  <Link key={l.label} to={l.href} className={styles.navLink}>
                    {l.label}
                  </Link>
                ))
              ) : (
                <>
                  {NAV_LINKS.map((l) => (
                    <a key={l.label} href={l.href} className={styles.navLink}>
                      {l.label}
                    </a>
                  ))}
                  <div ref={servicesRef} className={styles.dropdown}>
                    <button className={styles.navLink} onClick={toggleServices}>
                      Services <ChevronDown size={16} className={servicesDropdownOpen ? styles.chevronRotated : ""} />
                    </button>
                    <div className={`${styles.dropdownMenu} ${servicesDropdownOpen ? styles.open : ""}`}>
                      {SERVICE_LINKS.map((service) => (
                        <Link
                          key={service.label}
                          to={service.href}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setServicesDropdownOpen(false);
                            closeAllDropdowns();
                          }}
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )
            ) : (
              <>
                {NAV_LINKS.map((l) => (
                  <a key={l.label} href={l.href} className={styles.navLink}>
                    {l.label}
                  </a>
                ))}
                <div ref={servicesRef} className={styles.dropdown}>
                  <button className={styles.navLink} onClick={toggleServices}>
                    Services <ChevronDown size={16} className={servicesDropdownOpen ? styles.chevronRotated : ""} />
                  </button>
                  <div className={`${styles.dropdownMenu} ${servicesDropdownOpen ? styles.open : ""}`}>
                    {SERVICE_LINKS.map((service) => (
                      <Link
                        key={service.label}
                        to={service.href}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setServicesDropdownOpen(false);
                          closeAllDropdowns();
                        }}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div ref={loginRef} className={styles.dropdown}>
                  <button
                    className={`${styles.navLink} ${styles.dropdownToggle}`}
                    onClick={toggleLogin}
                  >
                    Login/Register <ChevronDown size={16} className={loginDropdownOpen ? styles.chevronRotated : ""} />
                  </button>
                  <div className={`${styles.dropdownMenu} ${loginDropdownOpen ? styles.open : ""}`}>
                    <Link to="/login?type=customer" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      As Customer
                    </Link>
                    <Link to="/login?type=vendor" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      As Vendor
                    </Link>
                    <Link to="/login?type=admin" className={styles.dropdownItem} onClick={closeAllDropdowns}>
                      As Admin
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>
        )}

        {/* Icons – only on desktop */}
        <div className={styles.right}>
          {/* Improved Profile Dropdown - Desktop */}
          {!isMobile && isAuthenticated && (
            <>
              {/* Search & Wishlist - Show only for Customers */}
              {user?.type === "customer" && (
                <>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                  >
                    <Search size={22} />
                  </button>

                  <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
                    <div className={styles.iconWrapper}>
                      <Heart size={22} />
                      {wishlistItems?.length > 0 && (
                        <span className={styles.badge}>{wishlistItems.length}</span>
                      )}
                    </div>
                  </Link>
                </>
              )}

              {/* Profile Dropdown */}
              <div ref={profileRef} className={styles.dropdown}>
                <button
                  className={`${styles.iconBtn} ${styles.profileBtn} ${styles.dropdownToggle}`}
                  onClick={toggleProfile}
                  aria-label="Profile"
                >
                  <User size={22} />
                </button>

                <div
                  className={`${styles.dropdownMenu} ${profileDropdownOpen ? styles.open : ""}`}
                  style={{ right: 0, left: "auto", minWidth: "220px" }}
                >
                  <Link
                    to="/my-bookings"
                    className={styles.dropdownItem}
                    onClick={closeAllDropdowns}
                  >
                    📅 My Bookings
                  </Link>

                  <Link
                    to="/payments"
                    className={styles.dropdownItem}
                    onClick={closeAllDropdowns}
                  >
                    💳 Payments
                  </Link>

                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={closeAllDropdowns}
                  >
                    ⚙️ Profile Settings
                  </Link>

                  {/* Optional: Show different options for Vendor */}
                  {user?.type === "vendor" && (
                    <>
                      <div className={styles.dropdownDivider}></div>
                      <Link
                        to="/vendor/my-services"
                        className={styles.dropdownItem}
                        onClick={closeAllDropdowns}
                      >
                        🛠️ My Services
                      </Link>
                      <Link
                        to="/vendor/analytics"
                        className={styles.dropdownItem}
                        onClick={closeAllDropdowns}
                      >
                        📊 Analytics
                      </Link>
                    </>
                  )}

                  {/* Divider before Logout */}
                  <div className={styles.dropdownDivider}></div>

                  {/* Logout Button - Desktop */}
                  <button
                    onClick={() => {
                      logout();
                      closeAllDropdowns();
                    }}
                    className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                  >
                    <HiOutlineLogout size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <div className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className={styles.drawerHeader}>
            <div className={styles.brandMini}>
              <img src={logo} alt="Mangalam logo" className={styles.logoMini} />
              <span className={styles.brandText}>Mangalam</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
          </div>

          {isAuthenticated && user && (
            <div className={styles.drawerUser}>
              <User size={32} />
              <div>
                <p className={styles.drawerUserName}>Hello, {user.name || "User"}</p>
                <p className={styles.drawerUserType}>{user.type}</p>
              </div>
            </div>
          )}

          <nav className={styles.drawerNav}>
            {/* Main links */}
            {isAuthenticated && user ? (
              user.type === "vendor" ? (
                VENDOR_NAV_LINKS.map((l) => (
                  <Link key={l.label} to={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))
              ) : user.type === "admin" ? (
                ADMIN_NAV_LINKS.map((l) => (
                  <Link key={l.label} to={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))
              ) : (
                NAV_LINKS.map((l) => (
                  <a key={l.label} href={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                ))
              )
            ) : (
              NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))
            )}

            {/* Quick Actions (moved icons) */}
            {isAuthenticated && (
              <div className={styles.drawerSection}>
                <div className={styles.drawerLinkTitle}>Quick Actions</div>

                <button
                  className={styles.drawerLink}
                  onClick={() => {
                    setSearchOpen(true);
                    setOpen(false);
                  }}
                >
                  <Search size={20} style={{ marginRight: 12 }} />
                  Search
                </button>

                <Link to="/wishlist" className={styles.drawerLink} onClick={() => setOpen(false)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Heart size={20} />
                    <span>Wishlist</span>
                    {wishlistItems?.length > 0 && (
                      <span className={styles.badge} style={{ marginLeft: "auto" }}>
                        {wishlistItems?.length}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Services */}
            {(!isAuthenticated || user?.type === "customer") && (
              <div ref={servicesMobileRef} className={styles.drawerSection}>
                <button
                  className={styles.drawerSectionHeader}
                  onClick={toggleServicesMobile}
                  aria-expanded={servicesMobileOpen}
                >
                  <span className={styles.drawerLinkTitle}>Services</span>
                  <ChevronDown className={`${styles.chevron} ${servicesMobileOpen ? styles.chevronOpen : ""}`} size={18} />
                </button>
                <div className={`${styles.drawerSectionContent} ${servicesMobileOpen ? styles.open : ""}`}>
                  {SERVICE_LINKS.map((service) => (
                    <Link
                      key={service.label}
                      to={service.href}
                      className={styles.drawerSubLink}
                      onClick={() => {
                        setOpen(false);
                        closeAllDropdowns();
                      }}
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Shopping */}
            {isAuthenticated && (
              <div ref={shoppingMobileRef} className={styles.drawerSection}>
                <button
                  className={styles.drawerSectionHeader}
                  onClick={toggleShoppingMobile}
                  aria-expanded={shoppingMobileOpen}
                >
                  <span className={styles.drawerLinkTitle}>Shopping</span>
                  <ChevronDown className={`${styles.chevron} ${shoppingMobileOpen ? styles.chevronOpen : ""}`} size={18} />
                </button>
                <div className={`${styles.drawerSectionContent} ${shoppingMobileOpen ? styles.open : ""}`}>
                  <Link
                    to="/wishlist"
                    className={styles.drawerSubLink}
                    onClick={() => {
                      setOpen(false);
                      closeAllDropdowns();
                    }}
                  >
                    Wishlist ({wishlistItems?.length})
                  </Link>
                </div>
              </div>
            )}

            {/* Auth / Account */}
            {!isAuthenticated ? (
              <div ref={authMobileRef} className={styles.drawerSection}>
                <button
                  className={styles.drawerSectionHeader}
                  onClick={toggleAuthMobile}
                  aria-expanded={authMobileOpen}
                >
                  <span className={styles.drawerLinkTitle}>Login / Register</span>
                  <ChevronDown className={`${styles.chevron} ${authMobileOpen ? styles.chevronOpen : ""}`} size={18} />
                </button>
                <div className={`${styles.drawerSectionContent} ${authMobileOpen ? styles.open : ""}`}>
                  <Link to="/login?type=customer" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    As Customer
                  </Link>
                  <Link to="/login?type=vendor" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    As Vendor
                  </Link>
                  <Link to="/login?type=admin" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    As Admin
                  </Link>
                </div>
              </div>
            ) : (
              <div ref={accountMobileRef} className={styles.drawerSection}>
                <button
                  className={styles.drawerSectionHeader}
                  onClick={toggleAccountMobile}
                  aria-expanded={accountMobileOpen}
                >
                  <span className={styles.drawerLinkTitle}>Account</span>
                  <ChevronDown className={`${styles.chevron} ${accountMobileOpen ? styles.chevronOpen : ""}`} size={18} />
                </button>
                <div className={`${styles.drawerSectionContent} ${accountMobileOpen ? styles.open : ""}`}>
                  <Link to="/my-bookings" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    My Bookings
                  </Link>
                  <Link to="/payments" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    Payments
                  </Link>
                  <Link to="/profile" className={styles.drawerSubLink} onClick={() => { setOpen(false); closeAllDropdowns(); }}>
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      closeAllDropdowns();
                    }}
                    className={styles.drawerLogout}
                  >
                    <HiOutlineLogout size={22} />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Backdrop */}
      {isMobile && open && (
        <div className={`${styles.backdrop} ${styles.backdropShow}`} onClick={() => setOpen(false)} aria-hidden={!open} />
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className={`${styles.searchOverlay} ${styles.searchOverlayOpen}`}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search venues, vendors, services..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className={styles.searchClose} onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;