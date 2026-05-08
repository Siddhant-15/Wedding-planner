import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import Brand from "./Brand";
import Dropdown from "./Dropdown";
import MobileDrawer from "./MobileDrawer";
import NotificationBell from "./NotificationBell";

import { useScrolled, useIsMobile } from "../hooks/useNavbarBehavior";
import styles from "../styles/VendorNavbar.module.css";

function VendorNavbar() {
    const navigate = useNavigate();
    const scrolled = useScrolled(8);
    const isMobile = useIsMobile(768);
    const isCompact = useIsMobile(1024);

    const { user, logout } = useAuth();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const initial = (user?.name || user?.email || "V").charAt(0).toUpperCase();

    const handleLogout = useCallback(() => {
        logout?.();
        navigate("/");
    }, [logout, navigate]);

    const navLinks = isCompact
        ? [
            { label: "Dashboard", to: "/vendor/dashboard" },
            { label: "Services", to: "/vendor/services" },
            { label: "Bookings", to: "/vendor/bookings" },
        ]
        : [
            { label: "Dashboard", to: "/vendor/dashboard" },
            { label: "My Services", to: "/vendor/services" },
            { label: "Bookings", to: "/vendor/bookings" },
            { label: "Analytics", to: "/vendor/analytics" },
            { label: "Leads", to: "/vendor/leads" },
        ];

    const profileItems = [
        {
            label: user?.name || "Vendor",
            desc: user?.email,
            icon: <span className={styles.avatarSmall}>{initial}</span>,
        },
        { divider: true },
        { label: "Profile Settings", to: "/profile-settings" },
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
                        </nav>
                    )}

                    {/* RIGHT */}
                    <div className={styles.right}>
                        {/* MOBILE */}
                        {isMobile && (
                            <>
                                <NotificationBell basePath="/vendor/notifications" />
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
                                <NotificationBell basePath="/vendor/notifications" />

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
                                                    {user?.name || "Vendor"}
                                                </span>
                                            )}
                                        </span>
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* MOBILE DRAWER */}
            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                isAuthenticated={true}
                user={user}
                onLogout={handleLogout}
                notificationsHref="/vendor/notifications"
            />
        </>
    );
}

export default VendorNavbar;
