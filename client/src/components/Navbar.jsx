import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import styles from "../styles/Navbar.module.css";
import logo from "@/assets/logo.png";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Venues", href: "#venues" },
  { label: "Vendors", href: "#vendors" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact Us", href: "#contact" },
  { label: "Login/Register", href: "#login" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className={styles.brand} aria-label="Mangalam Home">
            <img src={logo} alt="Mangalam logo" className={styles.logo} />
            <span className={styles.brandText}>Mangalam</span>
          </Link>
        </div>

        <nav className={styles.navCenter} aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className={styles.navLink}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={styles.right}>
          <button className={styles.iconBtn} aria-label="Search">
            <Search size={22} />
          </button>
          <button className={styles.iconBtn} aria-label="User">
            <User size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
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
        <nav className={styles.drawerNav} aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={styles.drawerLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropShow : ""}`}
        onClick={() => setOpen(false)}
      />
    </header>
  );
}

export default Navbar;
