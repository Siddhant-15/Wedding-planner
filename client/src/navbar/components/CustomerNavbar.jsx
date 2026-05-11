import React, { useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Heart, LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "../../Wishlist/src/context/WishlistContext";

import Brand from "./Brand";
import IconButton from "./IconButton";
import Dropdown from "./Dropdown";
import MobileDrawer from "./MobileDrawer";
import NotificationBell from "./NotificationBell";

import {
    SERVICE_LINKS,
    AUTH_LINKS,
    ACCOUNT_LINKS,
} from "../data/navConfig";

import { useScrolled, useIsMobile } from "../hooks/useNavbarBehavior";
import styles from "../styles/CustomerNavbar.module.css";

function CustomerNavbar() {
    const navigate = useNavigate();
    const scrolled = useScrolled(8);
    // ✅ Use 768px so we keep the desktop layout on tablets
    const isMobile = useIsMobile(768);
    const isCompact = useIsMobile(1024); // hide some links on tablet

    const { isAuthenticated, user, logout } = useAuth();


    const { items: wishlistItems } = useWishlist();
    const wishlistCount = wishlistItems?.length || 0;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

    const handleLogout = useCallback(() => {
        logout?.();
        navigate("/");
    }, [logout, navigate]);

    // Tablet trims to the most important links
    const navLinks = isCompact
        ? [
            { label: "Home", to: "/" },
            { label: "Venues", to: "/services/venue" },
        ]
        : [
            { label: "Home", to: "/" },
            { label: "Venues", to: "/services/venue" },
            { label: "Catering", to: "/services/catering" },
            { label: "Photography", to: "/services/photography" },
        ];

    const profileItems = [
        {
            label: user?.name || "My Account",
            desc: user?.id,
            icon: <span className={styles.avatarSmall}>{initial}</span>,
        },
        { divider: true },
        ...ACCOUNT_LINKS.map((a) => ({ label: a.label, to: a.to, icon: a.icon, desc: a.desc })),
        { divider: true },
        { label: "Logout", icon: LogOut, onClick: handleLogout, danger: true },
    ];

    return (
        <>
            <div className={styles.navbarSpacer} />

            <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
                <div className={styles.inner}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <Brand />
                    </div>

                    {/* CENTER */}
                    {!isMobile && (
                        <nav className={styles.center}>
                            {navLinks.map((l) => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    className={({ isActive }) =>
                                        `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}

                            <Dropdown
                                label="Services"
                                open={servicesOpen}
                                onOpenChange={setServicesOpen}
                                items={SERVICE_LINKS.map((s) => ({
                                    label: s.label,
                                    to: s.to,
                                    icon: s.icon,
                                }))}
                            />
                        </nav>
                    )}

                    {/* RIGHT */}
                    <div className={styles.right}>
                        {/* MOBILE */}
                        {isMobile && (
                            <>
                                {isAuthenticated && (
                                    <NotificationBell basePath="/customer/notifications" />
                                )}
                                <button
                                    className={styles.menuBtn}
                                    onClick={() => setDrawerOpen(true)}
                                    aria-label="Open menu"
                                >
                                    <Menu size={20} />
                                </button>
                            </>
                        )}

                        {/* DESKTOP / TABLET */}
                        {!isMobile && (
                            <>
                                {isAuthenticated && (
                                    <>
                                        <IconButton
                                            ariaLabel="Wishlist"
                                            onClick={() => navigate("/customer/wishlist")}
                                            badge={wishlistCount}
                                        >
                                            <Heart size={20} />
                                        </IconButton>

                                        <NotificationBell basePath="/customer/notifications" />
                                    </>
                                )}

                                {!isAuthenticated ? (
                                    <>
                                        <Dropdown
                                            label="Sign in"
                                            open={authOpen}
                                            onOpenChange={setAuthOpen}
                                            align="right"
                                            items={AUTH_LINKS}
                                        />

                                        {!isCompact && (
                                            <Link to="/become-vendor" className={styles.cta}>
                                                <Sparkles size={14} />
                                                Become a Vendor
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <Dropdown
                                        open={profileOpen}
                                        onOpenChange={setProfileOpen}
                                        align="right"
                                        items={profileItems}
                                        triggerContent={
                                            <span className={styles.avatarTrigger}>
                                                <span className={styles.avatar}>{initial}</span>
                                                {!isCompact && (
                                                    <span className={styles.avatarName}>
                                                        {user?.name || "Account"}
                                                    </span>
                                                )}
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
                notificationsHref="/notifications"
            />
        </>
    );
}

export default CustomerNavbar;
